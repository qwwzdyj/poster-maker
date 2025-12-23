'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PenTool, FileText, Wand2 } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import LoadingSpinner from './LoadingSpinner';
import PDFUploader from './PDFUploader';

interface ComposerTabProps {
    blueprint: string;
    composedText: string;
    setComposedText: (value: string) => void;
    onGenerate: (userInput: string, pdfText?: string) => Promise<void>;
    isGenerating: boolean;
}

export default function ComposerTab({
    blueprint,
    composedText,
    setComposedText,
    onGenerate,
    isGenerating,
}: ComposerTabProps) {
    const [pdfText, setPdfText] = useState('');
    const [additionalInstructions, setAdditionalInstructions] = useState('');

    const handleGenerate = () => {
        onGenerate(additionalInstructions || 'Please compose the paper following the blueprint.', pdfText);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6 h-full"
        >
            {/* PDF Upload Section */}
            <div className="glass-card p-4">
                <PDFUploader
                    onFileSelect={() => { }}
                    onTextExtracted={setPdfText}
                    isProcessing={false}
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
                {/* Left Panel - Blueprint (Read-only) */}
                <div className="glass-card p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-[var(--text-primary)]">Logic Blueprint</h3>
                            <p className="text-xs text-[var(--text-muted)]">From Step 1 (Read-only)</p>
                        </div>
                    </div>

                    <div className="flex-1 scroll-area rounded-xl bg-[rgba(15,15,25,0.5)] p-4 min-h-[300px]">
                        {blueprint ? (
                            <MarkdownRenderer content={blueprint} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <p className="text-[var(--text-muted)]">
                                    Complete Step 1 first to generate a blueprint
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Additional Instructions */}
                    <div className="mt-4">
                        <label className="block text-sm text-[var(--text-secondary)] mb-2">
                            Additional Style Instructions (Optional)
                        </label>
                        <textarea
                            value={additionalInstructions}
                            onChange={(e) => setAdditionalInstructions(e.target.value)}
                            placeholder="E.g., Use more passive voice, keep paragraphs under 150 words..."
                            className="glass-textarea h-20"
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !blueprint}
                        className="btn-gradient w-full flex items-center justify-center gap-2 py-3 mt-4"
                    >
                        <Wand2 className="w-5 h-5" />
                        {isGenerating ? 'Composing...' : 'Compose Paper Text'}
                    </button>
                </div>

                {/* Right Panel - Composed Text */}
                <div className="glass-card p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-secondary)] to-[var(--accent-tertiary)] flex items-center justify-center">
                            <PenTool className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-[var(--text-primary)]">Composed Text</h3>
                            <p className="text-xs text-[var(--text-muted)]">Streaming output</p>
                        </div>
                    </div>

                    <div className="flex-1 scroll-area rounded-xl bg-[rgba(15,15,25,0.5)] p-4 min-h-[400px]">
                        {isGenerating ? (
                            <div>
                                <LoadingSpinner text="The Composer is writing..." />
                                {composedText && (
                                    <div className="mt-4">
                                        <MarkdownRenderer content={composedText} />
                                    </div>
                                )}
                            </div>
                        ) : composedText ? (
                            <MarkdownRenderer content={composedText} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-16 h-16 rounded-full bg-[rgba(139,92,246,0.1)] flex items-center justify-center mb-4">
                                    <PenTool className="w-8 h-8 text-[var(--accent-secondary)] opacity-50" />
                                </div>
                                <p className="text-[var(--text-muted)]">
                                    Your composed paper text will appear here
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
