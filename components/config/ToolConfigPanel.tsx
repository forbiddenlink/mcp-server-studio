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

export function ToolConfigPanel() {
  const { selectedNodeId, tools, updateTool, deleteTool, selectNode } = useStore();
  const selectedTool = tools.find(tool => tool.id === selectedNodeId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parameters, setParameters] = useState<MCPParameter[]>([]);

  useEffect(() => {
    if (selectedTool) {
      setName(selectedTool.name);
      setDescription(selectedTool.description);
      setParameters([...selectedTool.parameters]);
    }
  }, [selectedTool]);

  const handleSave = () => {
    if (selectedNodeId) {
      updateTool(selectedNodeId, {
        name,
        description,
        parameters,
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
    newParams[index] = { ...newParams[index], ...updates };
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
          className="fixed right-0 top-16 bottom-0 w-[400px] glass-panel border-l border-border z-50 flex flex-col"
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">Configure Tool</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => selectNode(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-6">
            {/* Tool Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Tool Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Web Search"
              />
            </div>

            {/* Tool Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this tool do?"
                rows={3}
              />
            </div>

            {/* Parameters */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Parameters</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddParameter}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>

              {parameters.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <p>No parameters yet</p>
                  <p className="text-xs mt-1">Click "Add" to add a parameter</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {parameters.map((param, index) => (
                    <div key={index} className="glass-panel p-3 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          Parameter {index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteParameter(index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Input
                          placeholder="Parameter name"
                          value={param.name}
                          onChange={(e) => handleUpdateParameter(index, { name: e.target.value })}
                        />

                        <Select
                          value={param.type}
                          onValueChange={(value: ParameterType) =>
                            handleUpdateParameter(index, { type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
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
                        />

                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={param.required}
                            onChange={(e) =>
                              handleUpdateParameter(index, { required: e.target.checked })
                            }
                            className="rounded border-border"
                          />
                          <span>Required parameter</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-border space-y-2">
            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              className="w-full"
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
