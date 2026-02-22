'use client';

import { useStore } from '@/lib/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MCPParameter, ParameterType, StringFormat, SamplingConfig, ElicitationConfig, TasksConfig } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { CapabilitiesSection } from './CapabilitiesSection';

export function ToolConfigPanel() {
  const { selectedNodeId, tools, updateTool, deleteTool, selectNode } = useStore();
  const selectedTool = tools.find(tool => tool.id === selectedNodeId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parameters, setParameters] = useState<MCPParameter[]>([]);
  const [sampling, setSampling] = useState<SamplingConfig | undefined>(undefined);
  const [elicitation, setElicitation] = useState<ElicitationConfig | undefined>(undefined);
  const [tasks, setTasks] = useState<TasksConfig | undefined>(undefined);

  useEffect(() => {
    if (selectedTool) {
      setName(selectedTool.name);
      setDescription(selectedTool.description);
      setParameters([...selectedTool.parameters]);
      setSampling(selectedTool.sampling);
      setElicitation(selectedTool.elicitation);
      setTasks(selectedTool.tasks);
    }
  }, [selectedTool]);

  const handleSave = () => {
    if (selectedNodeId) {
      updateTool(selectedNodeId, {
        name,
        description,
        parameters,
        sampling,
        elicitation,
        tasks,
      });
    }
  };

  const handleAddParameter = () => {
    setParameters([
      ...parameters,
      {
        name: '',
        type: 'string',
        description: '',
        required: false,
      },
    ]);
  };

  const handleUpdateParameter = (index: number, updates: Partial<MCPParameter>) => {
    const newParams = [...parameters];
    let updatedParam = { ...newParams[index], ...updates };

    // Clear irrelevant constraints when type changes
    if (updates.type) {
      if (updates.type !== 'string') {
        // Clear string-specific constraints
        delete updatedParam.format;
        delete updatedParam.enum;
      }
      if (updates.type !== 'number') {
        // Clear number-specific constraints
        delete updatedParam.minimum;
        delete updatedParam.maximum;
      }
    }

    newParams[index] = updatedParam;
    setParameters(newParams);
  };

  const handleDeleteParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const handleDelete = () => {
    if (selectedNodeId && confirm('Delete this tool?')) {
      deleteTool(selectedNodeId);
      selectNode(null);
    }
  };

  return (
    <AnimatePresence>
      {selectedTool && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-16 bottom-0 w-full sm:w-[400px] surface-overlay border-l border-[var(--border-default)] z-50 flex flex-col"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-[var(--border-default)] flex items-center justify-between">
            <h3 className="font-semibold text-[var(--text-primary)]">Configure Tool</h3>
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
            {/* Tool Name */}
            <div className="space-y-3">
              <Label htmlFor="name" className="text-[var(--text-secondary)]">Tool Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Web Search"
                className="bg-[var(--bg-elevated)] border-[var(--border-default)] focus:border-[var(--accent)]"
              />
            </div>

            {/* Tool Description */}
            <div className="space-y-3">
              <Label htmlFor="description" className="text-[var(--text-secondary)]">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this tool do?"
                rows={3}
                className="bg-[var(--bg-elevated)] border-[var(--border-default)] focus:border-[var(--accent)]"
              />
            </div>

            {/* Parameters Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[var(--text-secondary)]">Parameters</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddParameter}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>

              {parameters.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-[var(--border-default)] rounded-lg">
                  <p className="text-sm text-[var(--text-secondary)]">No parameters yet</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">Click "Add" to add a parameter</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {parameters.map((param, index) => (
                    <div key={index} className="surface-elevated p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[var(--text-tertiary)]">
                          Parameter {index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDeleteParameter(index)}
                          className="text-[var(--text-tertiary)] hover:text-[var(--error)]"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <Input
                          placeholder="Parameter name"
                          value={param.name}
                          onChange={(e) => handleUpdateParameter(index, { name: e.target.value })}
                          className="bg-[var(--bg-surface)] border-[var(--border-default)]"
                        />

                        <Select
                          value={param.type}
                          onValueChange={(value: ParameterType) =>
                            handleUpdateParameter(index, { type: value })
                          }
                        >
                          <SelectTrigger className="bg-[var(--bg-surface)] border-[var(--border-default)]">
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
                          placeholder="Parameter description"
                          value={param.description}
                          onChange={(e) =>
                            handleUpdateParameter(index, { description: e.target.value })
                          }
                          rows={2}
                          className="bg-[var(--bg-surface)] border-[var(--border-default)]"
                        />

                        <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={param.required}
                            onChange={(e) =>
                              handleUpdateParameter(index, { required: e.target.checked })
                            }
                            className="rounded border-[var(--border-default)] bg-[var(--bg-surface)] checked:bg-[var(--accent)] checked:border-[var(--accent)]"
                          />
                          <span>Required parameter</span>
                        </label>

                        {/* String constraints */}
                        {param.type === 'string' && (
                          <div className="space-y-3 pt-2 border-t border-[var(--border-default)]">
                            <span className="text-xs font-medium text-[var(--text-tertiary)]">
                              String Constraints
                            </span>
                            <Select
                              value={param.format || 'none'}
                              onValueChange={(value) =>
                                handleUpdateParameter(index, {
                                  format: value === 'none' ? undefined : (value as StringFormat),
                                })
                              }
                            >
                              <SelectTrigger className="bg-[var(--bg-surface)] border-[var(--border-default)]">
                                <SelectValue placeholder="Format (optional)" />
                              </SelectTrigger>
                              <SelectContent className="surface-overlay">
                                <SelectItem value="none">No format</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="uri">URI</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="uuid">UUID</SelectItem>
                                <SelectItem value="date-time">Date-Time</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Enum values (comma-separated)"
                              value={param.enum?.join(', ') || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                const enumValues = value
                                  ? value.split(',').map((v) => v.trim()).filter(Boolean)
                                  : undefined;
                                handleUpdateParameter(index, {
                                  enum: enumValues && enumValues.length > 0 ? enumValues : undefined,
                                });
                              }}
                              className="bg-[var(--bg-surface)] border-[var(--border-default)]"
                            />
                          </div>
                        )}

                        {/* Number constraints */}
                        {param.type === 'number' && (
                          <div className="space-y-3 pt-2 border-t border-[var(--border-default)]">
                            <span className="text-xs font-medium text-[var(--text-tertiary)]">
                              Number Constraints
                            </span>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                placeholder="Min"
                                value={param.minimum ?? ''}
                                onChange={(e) =>
                                  handleUpdateParameter(index, {
                                    minimum: e.target.value === '' ? undefined : Number(e.target.value),
                                  })
                                }
                                className="bg-[var(--bg-surface)] border-[var(--border-default)] flex-1"
                              />
                              <Input
                                type="number"
                                placeholder="Max"
                                value={param.maximum ?? ''}
                                onChange={(e) =>
                                  handleUpdateParameter(index, {
                                    maximum: e.target.value === '' ? undefined : Number(e.target.value),
                                  })
                                }
                                className="bg-[var(--bg-surface)] border-[var(--border-default)] flex-1"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Advanced Capabilities */}
            <CapabilitiesSection
              sampling={sampling}
              elicitation={elicitation}
              tasks={tasks}
              onSamplingChange={setSampling}
              onElicitationChange={setElicitation}
              onTasksChange={setTasks}
            />
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-[var(--border-default)] space-y-3">
            <Button onClick={handleSave} className="w-full hover:shadow-[var(--shadow-glow)] transition-shadow">
              Save Changes
            </Button>
            <Button
              onClick={handleDelete}
              variant="outline"
              className="w-full text-[var(--error)] border-[var(--error)]/30 hover:bg-[var(--error)]/10 hover:border-[var(--error)]"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Tool
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
