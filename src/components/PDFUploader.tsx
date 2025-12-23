'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';

interface PDFUploaderProps {
    onFileSelect: (file: File) => void;
    onTextExtracted: (text: string) => void;
    isProcessing: boolean;
}

export default function PDFUploader({ onFileSelect, onTextExtracted, isProcessing }: PDFUploaderProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [extractedText, setExtractedText] = useState<string>('');

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/pdf') {
            handleFileSelect(files[0]);
        }
    }, []);

    const handleFileSelect = async (file: File) => {
        setSelectedFile(file);
        onFileSelect(file);

        // Dynamically import PDF parser to avoid SSR issues
        const { parsePDF } = await import('@/lib/pdf-parser');
        try {
            const result = await parsePDF(file);
            setExtractedText(result.fullText);
            onTextExtracted(result.fullText);
        } catch (error) {
            console.error('PDF parsing error:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setExtractedText('');
        onTextExtracted('');
    };

    return (
        <div className="space-y-4">
            <AnimatePresence mode="wait">
                {!selectedFile ? (
                    <motion.label
                        key="upload-zone"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`upload-zone block cursor-pointer ${isDragOver ? 'dragover' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleInputChange}
                            className="hidden"
                        />
                        <motion.div
                            className="flex flex-col items-center gap-3"
                            animate={isDragOver ? { scale: 1.02 } : { scale: 1 }}
                        >
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
                                <Upload className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <p className="text-[var(--text-primary)] font-medium">
                                    Drop your reference PDF here
                                </p>
                                <p className="text-sm text-[var(--text-muted)] mt-1">
                                    or click to browse (Optional - for style mimicry)
                                </p>
                            </div>
                        </motion.div>
                    </motion.label>
                ) : (
                    <motion.div
                        key="file-info"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass-card p-4"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-[var(--text-primary)] font-medium truncate max-w-[200px]">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-xs text-[var(--text-muted)]">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {extractedText && (
                                    <span className="badge-success">
                                        <CheckCircle className="w-3 h-3" />
                                        Parsed
                                    </span>
                                )}
                                <button
                                    onClick={clearFile}
                                    className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                                >
                                    <X className="w-4 h-4 text-[var(--text-muted)]" />
                                </button>
                            </div>
                        </div>

                        {extractedText && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="mt-4 pt-4 border-t border-[var(--glass-border)]"
                            >
                                <p className="text-xs text-[var(--text-muted)] mb-2">
                                    Extracted text preview ({extractedText.length} characters):
                                </p>
                                <div className="text-sm text-[var(--text-secondary)] max-h-24 overflow-y-auto scroll-area bg-[rgba(15,15,25,0.5)] p-3 rounded-lg">
                                    {extractedText.slice(0, 500)}...
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
