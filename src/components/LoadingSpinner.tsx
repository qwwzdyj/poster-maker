'use client';

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
    text?: string;
}

export default function LoadingSpinner({ text = 'Generating...' }: LoadingSpinnerProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-3 h-3 rounded-full"
                        style={{
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        }}
                        animate={{
                            y: [0, -12, 0],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </div>
            <motion.p
                className="text-sm text-[var(--text-secondary)]"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                {text}
            </motion.p>
        </div>
    );
}
