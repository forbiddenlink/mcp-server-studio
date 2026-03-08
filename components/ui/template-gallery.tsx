'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Plus,
  ChevronRight,
  FileText,
  Globe,
  Database,
  Mail,
  FilePlus,
  Terminal,
  Cloud,
  GitBranch,
  Image,
  Calculator,
  Calendar,
  MessageSquare,
  Code,
  Languages,
  Camera,
  FolderOpen,
  Send,
  Sparkles,
  Wrench,
  Trash2,
  FolderInput,
  MessageCircle,
  Smartphone,
  Key,
  CircleDot,
  GitPullRequest,
  Volume2,
  Mic,
  Heart,
  QrCode,
  Link,
  Braces,
  type LucideIcon,
} from 'lucide-react';
import { templateCategories } from '@/lib/templates/templateCategories';
import { ToolTemplate } from '@/lib/types';

// Icon mapping for templates
const iconMap: Record<string, LucideIcon> = {
  Search,
  FileText,
  Globe,
  Database,
  Mail,
  FilePlus,
  Terminal,
  Cloud,
  GitBranch,
  Image,
  Calculator,
  Calendar,
  MessageSquare,
  Code,
  Languages,
  Camera,
  FolderOpen,
  Send,
  Sparkles,
  Wrench,
  Trash2,
  FolderInput,
  MessageCircle,
  Smartphone,
  Key,
  CircleDot,
  GitPullRequest,
  Volume2,
  Mic,
  Heart,
  QrCode,
  Link,
  Braces,
  Plus,
};

const CategoryIcon = ({ iconName }: { iconName: string }) => {
  const Icon = iconMap[iconName] || Terminal;
  return <Icon className="w-5 h-5" strokeWidth={1.5} />;
};

const TemplateIcon = ({ iconName }: { iconName: string }) => {
  const Icon = iconMap[iconName] || Terminal;
  return <Icon className="w-4 h-4" strokeWidth={1.5} />;
};

interface TemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ToolTemplate) => void;
}

export function TemplateGallery({ isOpen, onClose, onSelectTemplate }: TemplateGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<ToolTemplate | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setSearchQuery('');
        setSelectedCategory(null);
        setPreviewTemplate(null);
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Filter templates based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return templateCategories;
    }

    const lowerQuery = searchQuery.toLowerCase();
    return templateCategories
      .map((category) => ({
        ...category,
        templates: category.templates.filter(
          (t) =>
            t.name.toLowerCase().includes(lowerQuery) ||
            t.description.toLowerCase().includes(lowerQuery)
        ),
      }))
      .filter((category) => category.templates.length > 0);
  }, [searchQuery]);

  // Get current templates to display
  const displayTemplates = useMemo(() => {
    if (selectedCategory) {
      const category = filteredCategories.find((c) => c.id === selectedCategory);
      return category?.templates || [];
    }
    // Show all templates when searching or on initial view
    if (searchQuery.trim()) {
      return filteredCategories.flatMap((c) => c.templates);
    }
    return null; // Show categories view
  }, [selectedCategory, filteredCategories, searchQuery]);

  const handleSelectTemplate = useCallback(
    (template: ToolTemplate) => {
      onSelectTemplate(template);
      onClose();
    },
    [onSelectTemplate, onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewTemplate) {
          setPreviewTemplate(null);
        } else if (selectedCategory) {
          setSelectedCategory(null);
        } else {
          onClose();
        }
      }
    },
    [previewTemplate, selectedCategory, onClose]
  );

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

          {/* Gallery Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-4 sm:inset-8 md:inset-12 lg:inset-16 z-[101] flex items-center justify-center"
            onKeyDown={handleKeyDown}
          >
            <div className="w-full max-w-4xl h-full max-h-[700px] surface-overlay shadow-2xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]">
                <div className="flex items-center gap-3">
                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180 text-[var(--text-secondary)]" />
                    </button>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                      {selectedCategory
                        ? filteredCategories.find((c) => c.id === selectedCategory)?.name
                        : 'Template Gallery'}
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {selectedCategory
                        ? filteredCategories.find((c) => c.id === selectedCategory)?.description
                        : 'Choose a template to add to your server'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="px-6 py-3 border-b border-[var(--border-default)]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[var(--bg-hover)]"
                    >
                      <X className="w-3 h-3 text-[var(--text-tertiary)]" />
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {displayTemplates === null ? (
                  // Categories Grid
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCategories.map((category) => (
                      <motion.button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className="group text-left p-5 rounded-xl border border-[var(--border-default)] hover:border-[var(--accent)] hover:shadow-[var(--shadow-glow)] bg-[var(--bg-elevated)] transition-all duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2.5 rounded-lg bg-[var(--accent-muted)] text-[var(--accent)]">
                            <CategoryIcon iconName={category.icon} />
                          </div>
                          <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
                        </div>
                        <h3 className="font-medium text-[var(--text-primary)] mb-1">
                          {category.name}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-3">
                          {category.description}
                        </p>
                        <div className="text-xs text-[var(--text-tertiary)]">
                          {category.templates.length} templates
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : displayTemplates.length === 0 ? (
                  // No results
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Search className="w-12 h-12 text-[var(--text-tertiary)] mb-4" />
                    <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                      No templates found
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Try adjusting your search or browse categories
                    </p>
                  </div>
                ) : (
                  // Templates Grid
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayTemplates.map((template, index) => (
                      <motion.div
                        key={`${template.name}-${index}`}
                        className="group relative p-4 rounded-xl border border-[var(--border-default)] hover:border-[var(--accent)] bg-[var(--bg-elevated)] transition-all duration-200"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-[var(--accent-muted)] text-[var(--accent)] flex-shrink-0">
                            <TemplateIcon iconName={template.icon} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-[var(--text-primary)] truncate">
                              {template.name}
                            </h4>
                            <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                              {template.description}
                            </p>
                          </div>
                        </div>

                        {/* Parameters preview */}
                        <div className="mb-4">
                          <div className="text-xs text-[var(--text-tertiary)] mb-1.5">
                            Parameters:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {template.defaultParameters.slice(0, 3).map((param) => (
                              <span
                                key={param.name}
                                className="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)] border border-[var(--border-default)]"
                              >
                                {param.name}
                                {param.required && (
                                  <span className="ml-0.5 text-red-400">*</span>
                                )}
                              </span>
                            ))}
                            {template.defaultParameters.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 text-xs text-[var(--text-tertiary)]">
                                +{template.defaultParameters.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewTemplate(template)}
                            className="flex-1 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => handleSelectTemplate(template)}
                            className="flex-1 px-3 py-2 text-sm text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-[var(--border-default)] flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                <span>
                  {filteredCategories.reduce((acc, c) => acc + c.templates.length, 0)} templates
                  available
                </span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-[var(--bg-elevated)] rounded border border-[var(--border-default)]">
                      esc
                    </kbd>
                    close
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Preview Modal */}
          <AnimatePresence>
            {previewTemplate && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[102] flex items-center justify-center p-4"
                onClick={() => setPreviewTemplate(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full max-w-md surface-overlay shadow-2xl p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-[var(--accent-muted)] text-[var(--accent)]">
                        <TemplateIcon iconName={previewTemplate.icon} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                          {previewTemplate.name}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {previewTemplate.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPreviewTemplate(null)}
                      className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)]"
                    >
                      <X className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </button>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">
                      Parameters
                    </h4>
                    <div className="space-y-2">
                      {previewTemplate.defaultParameters.map((param) => (
                        <div
                          key={param.name}
                          className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)]"
                        >
                          <code className="px-2 py-0.5 text-xs bg-[var(--bg-surface)] rounded text-[var(--accent)] font-mono">
                            {param.name}
                          </code>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs text-[var(--text-tertiary)]">
                                {param.type}
                              </span>
                              {param.required && (
                                <span className="text-xs text-red-400">required</span>
                              )}
                            </div>
                            <p className="text-sm text-[var(--text-secondary)]">
                              {param.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setPreviewTemplate(null)}
                      className="flex-1 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] rounded-lg border border-[var(--border-default)] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleSelectTemplate(previewTemplate);
                        setPreviewTemplate(null);
                      }}
                      className="flex-1 px-4 py-2.5 text-sm text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add to Canvas
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
