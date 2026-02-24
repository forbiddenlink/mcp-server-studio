'use client';

import { useStore } from '@/lib/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MCPParameter, ParameterType } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

export function PromptConfigPanel() {
  const { selectedNodeId, prompts, updatePrompt, deletePrompt, selectNode } = useStore();
  const selectedPrompt = prompts.find(prompt => prompt.id === selectedNodeId);

  const [name, setName] = useState(selectedPrompt?.name || '');
  const [description, setDescription] = useState(selectedPrompt?.description || '');
  const [args, setArgs] = useState<MCPParameter[]>(selectedPrompt?.arguments ? [...selectedPrompt.arguments] : []);

  const handleSave = () => {
    if (selectedNodeId) {
      updatePrompt(selectedNodeId, {
        name,
        description,
        arguments: args,
      });
    }
  };

  const handleAddArgument = () => {
    setArgs([
      ...args,
      {
        name: '',
        type: 'string',
        description: '',
        required: false,
      },
    ]);
  };

  const handleUpdateArgument = (index: number, updates: Partial<MCPParameter>) => {
    const newArgs = [...args];
    newArgs[index] = { ...newArgs[index], ...updates };
    setArgs(newArgs);
  };

  const handleDeleteArgument = (index: number) => {
    setArgs(args.filter((_, i) => i !== index));
  };

  const handleDelete = () => {
    if (selectedNodeId && confirm('Delete this prompt?')) {
      deletePrompt(selectedNodeId);
      selectNode(null);
    }
  };

  return (
    <AnimatePresence>
      {selectedPrompt && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-16 bottom-0 w-full sm:w-[400px] surface-overlay border-l border-[var(--border-default)] z-50 flex flex-col"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-[var(--border-default)] flex items-center justify-between">
            <h3 className="font-semibold text-[var(--text-primary)]">Configure Prompt</h3>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => selectNode(null)}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-5 space-y-8">
            {/* Prompt Name */}
            <div className="space-y-3">
              <Label htmlFor="name" className="text-[var(--text-secondary)]">Prompt Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., summarize_text"
                className="bg-[var(--bg-base)] border-[var(--border-default)] focus:border-[var(--accent)]"
              />
            </div>

            {/* Prompt Description */}
            <div className="space-y-3">
              <Label htmlFor="description" className="text-[var(--text-secondary)]">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this prompt do?"
                rows={3}
                className="bg-[var(--bg-base)] border-[var(--border-default)] focus:border-[var(--accent)]"
              />
            </div>

            {/* Arguments Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[var(--text-secondary)]">Arguments</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddArgument}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>

              {args.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-[var(--border-default)] rounded-lg">
                  <p className="text-sm text-[var(--text-secondary)]">No arguments yet</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">Click &quot;Add&quot; to add an argument</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {args.map((arg, index) => (
                    <div key={index} className="py-5 border-t border-[var(--border-default)] first:border-t-0 first:pt-0 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[var(--text-tertiary)]">
                          Argument {index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDeleteArgument(index)}
                          className="text-[var(--text-tertiary)] hover:text-[var(--error)]"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <Input
                          placeholder="Argument name"
                          value={arg.name}
                          onChange={(e) => handleUpdateArgument(index, { name: e.target.value })}
                          className="bg-[var(--bg-base)] border-[var(--border-default)]"
                        />

                        <Select
                          value={arg.type}
                          onValueChange={(value: ParameterType) =>
                            handleUpdateArgument(index, { type: value })
                          }
                        >
                          <SelectTrigger className="bg-[var(--bg-base)] border-[var(--border-default)]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="surface-overlay">
                            <SelectItem value="string">String</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                            <SelectItem value="array">Array</SelectItem>
                            <SelectItem value="object">Object</SelectItem>
                          </SelectContent>
                        </Select>

                        <Textarea
                          placeholder="Argument description"
                          value={arg.description}
                          onChange={(e) =>
                            handleUpdateArgument(index, { description: e.target.value })
                          }
                          rows={2}
                          className="bg-[var(--bg-base)] border-[var(--border-default)]"
                        />

                        <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={arg.required}
                            onChange={(e) =>
                              handleUpdateArgument(index, { required: e.target.checked })
                            }
                            className="rounded border-[var(--border-default)] bg-[var(--bg-surface)] checked:bg-[var(--accent)] checked:border-[var(--accent)]"
                          />
                          <span>Required argument</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-[var(--border-default)] space-y-3">
            <Button onClick={handleSave} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white border-0 transition-colors">
              Save Changes
            </Button>
            <Button
              onClick={handleDelete}
              variant="outline"
              className="w-full text-[var(--error)] border-[var(--error)]/30 hover:bg-[var(--error)]/10 hover:border-[var(--error)]"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Prompt
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
