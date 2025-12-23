import { PROMPT_STRATEGIST, PROMPT_COMPOSER, PROMPT_REVIEWER } from './constants/prompts';

export interface AIConfig {
    apiKey: string;
    baseUrl: string;
    model: string;
}

export interface GenerateRequest {
    step: 1 | 2 | 3;
    userInput: string;
    blueprint?: string;
    composedText?: string;
    pdfText?: string;
    config: AIConfig;
}

function isGoogleAPI(baseUrl: string): boolean {
    return baseUrl.includes('googleapis.com') || baseUrl.includes('generativelanguage.googleapis.com');
}

function buildSystemPrompt(step: 1 | 2 | 3, pdfText?: string): string {
    switch (step) {
        case 1:
            return PROMPT_STRATEGIST;
        case 2:
            return pdfText
                ? `[REFERENCE STYLE TEXT]\n${pdfText}\n\n${PROMPT_COMPOSER}`
                : PROMPT_COMPOSER;
        case 3:
            return PROMPT_REVIEWER;
        default:
            return PROMPT_STRATEGIST;
    }
}

function buildUserMessage(step: 1 | 2 | 3, userInput: string, blueprint?: string, composedText?: string): string {
    switch (step) {
        case 1:
            return userInput;
        case 2:
            return `[LOGIC BLUEPRINT]\n${blueprint}\n\n[USER INSTRUCTIONS]\n${userInput}`;
        case 3:
            return `[COMPOSED TEXT]\n${composedText}\n\n[USER INSTRUCTIONS]\n${userInput}`;
        default:
            return userInput;
    }
}

export async function* streamGenerate(request: GenerateRequest): AsyncGenerator<string, void, unknown> {
    const { step, userInput, blueprint, composedText, pdfText, config } = request;
    const systemPrompt = buildSystemPrompt(step, pdfText);
    const userMessage = buildUserMessage(step, userInput, blueprint, composedText);

    if (isGoogleAPI(config.baseUrl)) {
        yield* streamGoogleGenerate(systemPrompt, userMessage, config);
    } else {
        yield* streamOpenAIGenerate(systemPrompt, userMessage, config);
    }
}

async function* streamOpenAIGenerate(
    systemPrompt: string,
    userMessage: string,
    config: AIConfig
): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
            model: config.model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            stream: true,
            max_tokens: 8192,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') return;
                try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) yield content;
                } catch {
                    // Skip invalid JSON
                }
            }
        }
    }
}

async function* streamGoogleGenerate(
    systemPrompt: string,
    userMessage: string,
    config: AIConfig
): AsyncGenerator<string, void, unknown> {
    const url = `${config.baseUrl}/v1beta/models/${config.model}:streamGenerateContent?alt=sse&key=${config.apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [
                { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] },
            ],
            generationConfig: {
                maxOutputTokens: 8192,
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google API Error: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6);
                try {
                    const parsed = JSON.parse(data);
                    const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (content) yield content;
                } catch {
                    // Skip invalid JSON
                }
            }
        }
    }
}
