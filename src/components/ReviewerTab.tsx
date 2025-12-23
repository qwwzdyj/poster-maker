'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Play, ChevronRight, Target, HelpCircle, Scale } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import LoadingSpinner from './LoadingSpinner';

interface ReviewerTabProps {
    composedText: string;
    onReview: (userInput: string) => Promise<void>;
    isReviewing: boolean;
    reviewResult: string;
}

interface ReviewComment {
    type: 'evidence' | 'definition' | 'overclaim';
    title: string;
    content: string;
    suggestion: string;
}

function parseReviewComments(text: string): ReviewComment[] {
    // Simple parsing - in production could be more sophisticated
    const comments: ReviewComment[] = [];
    const lines = text.split('\n');
    let currentComment: Partial<ReviewComment> | null = null;

    for (const line of lines) {
        if (line.includes('证据链断裂') || line.includes('Evidence')) {
            if (currentComment) comments.push(currentComment as ReviewComment);
            currentComment = { type: 'evidence', title: '', content: '', suggestion: '' };
        } else if (line.includes('定义歧义') || line.includes('Definition')) {
            if (currentComment) comments.push(currentComment as ReviewComment);
            currentComment = { type: 'definition', title: '', content: '', suggestion: '' };
        } else if (line.includes('傲慢检查') || line.includes('Overclaim')) {
            if (currentComment) comments.push(currentComment as ReviewComment);
            currentComment = { type: 'overclaim', title: '', content: '', suggestion: '' };
        }
    }
    if (currentComment) comments.push(currentComment as ReviewComment);

    return comments;
}

export default function ReviewerTab({
    composedText,
    onReview,
    isReviewing,
    reviewResult,
}: ReviewerTabProps) {
    const [showSidebar, setShowSidebar] = useState(false);

    const handleReview = () => {
        onReview('Please review this draft critically.');
        setShowSidebar(true);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'evidence':
                return <Target className="w-4 h-4" />;
            case 'definition':
                return <HelpCircle className="w-4 h-4" />;
            case 'overclaim':
                return <Scale className="w-4 h-4" />;
            default:
                return <AlertTriangle className="w-4 h-4" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex gap-6 h-full"
        >
            {/* Main Content */}
            <div className="flex-1 glass-card p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-[var(--text-primary)]">Paper Draft</h3>
                            <p className="text-xs text-[var(--text-muted)]">Ready for Reviewer #2's scrutiny</p>
                        </div>
                    </div>

                    <button
                        onClick={handleReview}
                        disabled={isReviewing || !composedText}
                        className="btn-gradient flex items-center gap-2"
                    >
                        <Play className="w-4 h-4" />
                        {isReviewing ? 'Reviewing...' : 'Run Review'}
                    </button>
                </div>

                <div className="flex-1 scroll-area rounded-xl bg-[rgba(15,15,25,0.5)] p-6 min-h-[500px]">
                    {composedText ? (
                        <MarkdownRenderer content={composedText} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 rounded-full bg-[rgba(239,68,68,0.1)] flex items-center justify-center mb-4">
                                <Shield className="w-8 h-8 text-red-500 opacity-50" />
                            </div>
                            <p className="text-[var(--text-muted)]">
                                Complete Step 2 first to compose paper text
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Review Sidebar */}
            <AnimatePresence>
                {(showSidebar || reviewResult) && (
                    <motion.div
                        initial={{ opacity: 0, x: 50, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: 400 }}
                        exit={{ opacity: 0, x: 50, width: 0 }}
                        transition={{ duration: 0.3 }}
                        className="glass-card p-6 flex flex-col overflow-hidden"
                        style={{ minWidth: 400 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[var(--text-primary)]">Reviewer #2</h3>
                                <p className="text-xs text-red-400">The notorious critic</p>
                            </div>
                        </div>

                        <div className="flex-1 scroll-area">
                            {isReviewing ? (
                                <LoadingSpinner text="Reviewer #2 is scrutinizing your work..." />
                            ) : reviewResult ? (
                                <div className="space-y-4">
                                    {/* Criticism Header */}
                                    <div className="p-4 rounded-xl bg-gradient-to-r from-[rgba(239,68,68,0.15)] to-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.2)]">
                                        <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            Critical Review Report
                                        </div>
                                        <p className="text-xs text-[var(--text-muted)]">
                                            The following issues require your attention before submission.
                                        </p>
                                    </div>

                                    {/* Review Content */}
                                    <div className="space-y-3">
                                        <MarkdownRenderer content={reviewResult} />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <p className="text-[var(--text-muted)] text-sm">
                                        Click "Run Review" to start the critical analysis
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Action Hint */}
                        {reviewResult && !isReviewing && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 pt-4 border-t border-[var(--glass-border)]"
                            >
                                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                    <ChevronRight className="w-4 h-4 text-[var(--accent-primary)]" />
                                    <span>Go back to Step 1 to refine your blueprint based on feedback</span>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
