'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Server, Cpu, Save, CheckCircle } from 'lucide-react';
import { saveSettings, getSettings } from '@/lib/storage';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: { apiKey: string; baseUrl: string; model: string }) => void;
}

export default function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
    const [apiKey, setApiKey] = useState('');
    const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
    const [model, setModel] = useState('gpt-4o');
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadSettings();
        }
    }, [isOpen]);

    const loadSettings = async () => {
        const settings = await getSettings();
        if (settings) {
            setApiKey(settings.apiKey || '');
            setBaseUrl(settings.baseUrl || 'https://api.openai.com/v1');
            setModel(settings.model || 'gpt-4o');
        }
    };

    const handleSave = async () => {
        const settings = { apiKey, baseUrl, model };
        await saveSettings(settings);
        onSave(settings);
        setIsSaved(true);
        setTimeout(() => {
            setIsSaved(false);
            onClose();
        }, 1000);
    };

    const presets = [
        { name: 'OpenAI GPT-4o', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' },
        { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
        { name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com', model: 'gemini-1.5-pro' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg glass-card p-6 z-50"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
                                API Configuration
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                            >
                                <X className="w-5 h-5 text-[var(--text-muted)]" />
                            </button>
                        </div>

                        {/* Presets */}
                        <div className="mb-6">
                            <label className="block text-sm text-[var(--text-secondary)] mb-2">
                                Quick Presets
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {presets.map((preset) => (
                                    <button
                                        key={preset.name}
                                        onClick={() => {
                                            setBaseUrl(preset.baseUrl);
                                            setModel(preset.model);
                                        }}
                                        className={`btn-ghost text-xs ${baseUrl === preset.baseUrl && model === preset.model
                                                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                                                : ''
                                            }`}
                                    >
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-2">
                                    <Key className="w-4 h-4" /> API Key
                                </label>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="sk-..."
                                    className="glass-input"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-2">
                                    <Server className="w-4 h-4" /> Base URL
                                </label>
                                <input
                                    type="text"
                                    value={baseUrl}
                                    onChange={(e) => setBaseUrl(e.target.value)}
                                    placeholder="https://api.openai.com/v1"
                                    className="glass-input"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-2">
                                    <Cpu className="w-4 h-4" /> Model
                                </label>
                                <input
                                    type="text"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    placeholder="gpt-4o"
                                    className="glass-input"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--glass-border)]">
                            <button onClick={onClose} className="btn-ghost">
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!apiKey}
                                className="btn-gradient flex items-center gap-2"
                            >
                                {isSaved ? (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Saved!
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Settings
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
