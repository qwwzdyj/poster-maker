'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Lightbulb } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import LoadingSpinner from './LoadingSpinner';

interface StrategistTabProps {
    blueprint: string;
    setBlueprint: (value: string) => void;
    onGenerate: (userInput: string) => Promise<void>;
    isGenerating: boolean;
}

export default function StrategistTab({
    blueprint,
    setBlueprint,
    onGenerate,
    isGenerating,
}: StrategistTabProps) {
    const [variableTable, setVariableTable] = useState('');
    const [outline, setOutline] = useState('');

    const handleGenerate = () => {
        const input = `【变量定义表】\n${variableTable}\n\n【论文大纲/素材】\n${outline}`;
        onGenerate(input);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full"
        >
            {/* Left Panel - Input */}
            <div className="glass-card p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[var(--text-primary)]">Input Materials</h3>
                        <p className="text-xs text-[var(--text-muted)]">Define your variables and outline</p>
                    </div>
                </div>

                <div className="space-y-4 flex-1 flex flex-col">
                    {/* Variable Table */}
                    <div>
                        <label className="block text-sm text-[var(--text-secondary)] mb-2">
                            <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                                Variable Definition Table (LaTeX symbols)
                            </span>
                        </label>
                        <textarea
                            value={variableTable}
                            onChange={(e) => setVariableTable(e.target.value)}
                            placeholder={`$\\mathcal{L}_{total}$ - 总损失函数
$\\alpha$ - 学习率
$\\theta$ - 模型参数
...`}
                            className="glass-textarea h-32"
                        />
                    </div>

                    {/* Outline */}
                    <div className="flex-1 flex flex-col">
                        <label className="block text-sm text-[var(--text-secondary)] mb-2">
                            <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)]" />
                                Paper Outline / Research Materials
                            </span>
                        </label>
                        <textarea
                            value={outline}
                            onChange={(e) => setOutline(e.target.value)}
                            placeholder="Paste your research notes, experimental data, key findings, or rough outline here..."
                            className="glass-textarea flex-1 min-h-[200px]"
                        />
                    </div>

                    {/* Tips */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[rgba(99,102,241,0.1)] to-[rgba(139,92,246,0.05)] border border-[rgba(99,102,241,0.2)]">
                        <div className="flex items-start gap-3">
                            <Lightbulb className="w-5 h-5 text-[var(--accent-primary)] mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-[var(--text-secondary)]">
                                <p className="font-medium text-[var(--text-primary)] mb-1">Pro Tip</p>
                                <p>Include all mathematical symbols you plan to use. The more detailed your variable table, the more consistent your paper's notation will be.</p>
                            </div>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || (!variableTable && !outline)}
                        className="btn-gradient w-full flex items-center justify-center gap-2 py-4"
                    >
                        <Sparkles className="w-5 h-5" />
                        {isGenerating ? 'Generating Blueprint...' : 'Generate Logic Blueprint'}
                    </button>
                </div>
            </div>

            {/* Right Panel - Output */}
            <div className="glass-card p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-secondary)] to-[var(--accent-tertiary)] flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[var(--text-primary)]">Logic Blueprint</h3>
                        <p className="text-xs text-[var(--text-muted)]">Your paper's structural foundation</p>
                    </div>
                </div>

                <div className="flex-1 scroll-area rounded-xl bg-[rgba(15,15,25,0.5)] p-4 min-h-[400px]">
                    {isGenerating ? (
                        <LoadingSpinner text="The Strategist is analyzing your materials..." />
                    ) : blueprint ? (
                        <MarkdownRenderer content={blueprint} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 rounded-full bg-[rgba(99,102,241,0.1)] flex items-center justify-center mb-4">
                                <Sparkles className="w-8 h-8 text-[var(--accent-primary)] opacity-50" />
                            </div>
                            <p className="text-[var(--text-muted)]">
                                Your blueprint will appear here after generation
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
