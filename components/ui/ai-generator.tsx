'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Wand2,
  X,
  ChevronRight,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from './button';
import { parseToolDescription, analyzeDescription } from '@/lib/generators/aiToolGenerator';
import { MCPTool } from '@/lib/types';

interface AIGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (tool: MCPTool) => void;
}

const examplePrompts = [
  'A tool that searches a database for users by email and returns their profile',
  'Get weather forecast for a city given its name',
  'Send a notification message to a Slack channel',
  'Create a new task with title, description, and due date',
  'Convert an image to different formats by URL',
  'Validate an email address and check if it exists',
];

export function AIGenerator({ isOpen, onClose, onGenerate }: AIGeneratorProps) {
  const [description, setDescription] = useState('');
  const [generatedTool, setGeneratedTool] = useState<MCPTool | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeDescription> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setDescription('');
        setGeneratedTool(null);
        setAnalysis(null);
        textareaRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Analyze description as user types (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (description.length >= 5) {
        setAnalysis(analyzeDescription(description));
      } else {
        setAnalysis(null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [description]);

  const handleGenerate = useCallback(() => {
    if (!description.trim() || description.length < 5) return;

    setIsGenerating(true);

    // Simulate a brief "thinking" delay for that magical feel
    setTimeout(() => {
      const tool = parseToolDescription(description);
      setGeneratedTool(tool);
      setIsGenerating(false);
    }, 600);
  }, [description]);

  const handleConfirm = useCallback(() => {
    if (generatedTool) {
      onGenerate(generatedTool);
      onClose();
    }
  }, [generatedTool, onGenerate, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (generatedTool) {
          setGeneratedTool(null);
        } else {
          onClose();
        }
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (generatedTool) {
          handleConfirm();
        } else if (description.trim()) {
          handleGenerate();
        }
      }
    },
    [generatedTool, description, handleGenerate, handleConfirm, onClose]
  );

  const setExamplePrompt = (prompt: string) => {
    setDescription(prompt);
    setGeneratedTool(null);
    textareaRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[101]"
            onKeyDown={handleKeyDown}
          >
            <div className="surface-overlay shadow-2xl overflow-hidden mx-4">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                      Generate Tool with AI
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Describe what you want and we will create it
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {!generatedTool ? (
                  <>
                    {/* Input Section */}
                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your tool in natural language..."
                        className="w-full h-32 px-4 py-3 text-sm bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent resize-none"
                      />

                      {/* Confidence indicator */}
                      {analysis && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -bottom-8 left-0 flex items-center gap-2"
                        >
                          <div className="h-1.5 w-24 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${analysis.confidence * 100}%` }}
                              className={`h-full rounded-full ${
                                analysis.confidence > 0.7
                                  ? 'bg-emerald-500'
                                  : analysis.confidence > 0.4
                                  ? 'bg-amber-500'
                                  : 'bg-red-400'
                              }`}
                            />
                          </div>
                          <span className="text-xs text-[var(--text-tertiary)]">
                            {analysis.confidence > 0.7
                              ? 'Great description!'
                              : analysis.confidence > 0.4
                              ? 'Good start'
                              : 'Add more detail'}
                          </span>
                        </motion.div>
                      )}
                    </div>

                    {/* Suggestions */}
                    {analysis && analysis.suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-10 space-y-2"
                      >
                        <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                          Tips to improve
                        </p>
                        {analysis.suggestions.map((suggestion, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                          >
                            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span>{suggestion}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {/* Example Prompts */}
                    {!description && (
                      <div className="mt-6">
                        <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
                          Try an example
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {examplePrompts.slice(0, 3).map((prompt, i) => (
                            <button
                              key={i}
                              onClick={() => setExamplePrompt(prompt)}
                              className="px-3 py-1.5 text-xs bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] rounded-lg transition-colors truncate max-w-xs"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Generate Button */}
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={handleGenerate}
                        disabled={!description.trim() || description.length < 5 || isGenerating}
                        className="relative overflow-hidden group"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Generate Tool
                            <kbd className="ml-3 px-1.5 py-0.5 text-xs bg-white/20 rounded">
                              {navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Enter
                            </kbd>
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  /* Preview Section */
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Check className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-500">
                        Tool generated successfully!
                      </span>
                    </div>

                    {/* Tool Preview Card */}
                    <div className="bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[var(--accent-muted)] flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-6 h-6 text-[var(--accent)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                            {generatedTool.name}
                          </h3>
                          <p className="text-sm text-[var(--text-secondary)] mt-1">
                            {generatedTool.description}
                          </p>

                          {/* Parameters */}
                          {generatedTool.parameters.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                                Parameters ({generatedTool.parameters.length})
                              </p>
                              <div className="space-y-2">
                                {generatedTool.parameters.map((param, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-3 text-sm"
                                  >
                                    <code className="px-2 py-0.5 bg-[var(--bg-elevated)] text-[var(--accent)] rounded font-mono text-xs">
                                      {param.name}
                                    </code>
                                    <span className="text-[var(--text-tertiary)]">
                                      {param.type}
                                    </span>
                                    {param.required && (
                                      <span className="px-1.5 py-0.5 text-xs bg-red-500/10 text-red-400 rounded">
                                        required
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex items-center justify-between">
                      <button
                        onClick={() => setGeneratedTool(null)}
                        className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180 inline mr-1" />
                        Go back and edit
                      </button>
                      <Button onClick={handleConfirm}>
                        <Check className="w-4 h-4 mr-2" />
                        Add Tool to Canvas
                        <kbd className="ml-3 px-1.5 py-0.5 text-xs bg-white/20 rounded">
                          {navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Enter
                        </kbd>
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-[var(--border-default)] flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                <span>Powered by smart pattern matching</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-[var(--bg-elevated)] rounded border border-[var(--border-default)]">
                      Esc
                    </kbd>
                    close
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
