'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Atom, Sparkles, PenTool, Shield, Github } from 'lucide-react';
import StrategistTab from '@/components/StrategistTab';
import ComposerTab from '@/components/ComposerTab';
import ReviewerTab from '@/components/ReviewerTab';
import SettingsModal from '@/components/SettingsModal';
import { streamGenerate, AIConfig } from '@/lib/api';
import { getSettings } from '@/lib/storage';

type TabType = 'strategist' | 'composer' | 'reviewer';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('strategist');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [config, setConfig] = useState<AIConfig | null>(null);

  // State for each step
  const [blueprint, setBlueprint] = useState('');
  const [composedText, setComposedText] = useState('');
  const [reviewResult, setReviewResult] = useState('');

  // Loading states
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loadConfig = async () => {
      const settings = await getSettings();
      if (settings) {
        setConfig(settings);
      }
    };
    loadConfig();
  }, []);

  const handleSettingsSave = (settings: AIConfig) => {
    setConfig(settings);
  };

  // Generate Blueprint (Step 1)
  const handleGenerateBlueprint = useCallback(async (userInput: string) => {
    if (!config?.apiKey) {
      setIsSettingsOpen(true);
      return;
    }

    setIsGeneratingBlueprint(true);
    setBlueprint('');

    try {
      const generator = streamGenerate({
        step: 1,
        userInput,
        config,
      });

      for await (const chunk of generator) {
        setBlueprint((prev) => prev + chunk);
      }
    } catch (error) {
      console.error('Generation error:', error);
      setBlueprint(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingBlueprint(false);
    }
  }, [config]);

  // Compose Paper (Step 2)
  const handleCompose = useCallback(async (userInput: string, pdfText?: string) => {
    if (!config?.apiKey) {
      setIsSettingsOpen(true);
      return;
    }

    setIsComposing(true);
    setComposedText('');

    try {
      const generator = streamGenerate({
        step: 2,
        userInput,
        blueprint,
        pdfText,
        config,
      });

      for await (const chunk of generator) {
        setComposedText((prev) => prev + chunk);
      }
    } catch (error) {
      console.error('Composition error:', error);
      setComposedText(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsComposing(false);
    }
  }, [config, blueprint]);

  // Review Paper (Step 3)
  const handleReview = useCallback(async (userInput: string) => {
    if (!config?.apiKey) {
      setIsSettingsOpen(true);
      return;
    }

    setIsReviewing(true);
    setReviewResult('');

    try {
      const generator = streamGenerate({
        step: 3,
        userInput,
        composedText,
        config,
      });

      for await (const chunk of generator) {
        setReviewResult((prev) => prev + chunk);
      }
    } catch (error) {
      console.error('Review error:', error);
      setReviewResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsReviewing(false);
    }
  }, [config, composedText]);

  const tabs = [
    { id: 'strategist' as TabType, label: 'The Strategist', icon: Sparkles, step: 1 },
    { id: 'composer' as TabType, label: 'The Composer', icon: PenTool, step: 2 },
    { id: 'reviewer' as TabType, label: 'The Reviewer', icon: Shield, step: 3 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--glass-border)] bg-[rgba(10,10,15,0.8)] backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <motion.div
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] flex items-center justify-center shadow-lg shadow-[var(--accent-glow)]"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Atom className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent">
                  Paper Architect
                </h1>
                <p className="text-xs text-[var(--text-muted)]">3.0 • AI-Powered Academic Writing</p>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="btn-ghost flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">
        {/* Tab Navigation */}
        <div className="tab-container mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span className="step-number">{tab.step}</span>
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          <AnimatePresence mode="wait">
            {activeTab === 'strategist' && (
              <StrategistTab
                key="strategist"
                blueprint={blueprint}
                setBlueprint={setBlueprint}
                onGenerate={handleGenerateBlueprint}
                isGenerating={isGeneratingBlueprint}
              />
            )}
            {activeTab === 'composer' && (
              <ComposerTab
                key="composer"
                blueprint={blueprint}
                composedText={composedText}
                setComposedText={setComposedText}
                onGenerate={handleCompose}
                isGenerating={isComposing}
              />
            )}
            {activeTab === 'reviewer' && (
              <ReviewerTab
                key="reviewer"
                composedText={composedText}
                onReview={handleReview}
                isReviewing={isReviewing}
                reviewResult={reviewResult}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--glass-border)] bg-[rgba(10,10,15,0.6)] mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
            <p>© 2024 Paper Architect. Crafted for Academic Excellence.</p>
            <div className="flex items-center gap-4">
              <span className="badge-success">
                {config?.apiKey ? 'API Connected' : 'API Not Configured'}
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSettingsSave}
      />
    </div>
  );
}
