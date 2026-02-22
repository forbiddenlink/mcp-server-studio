'use client';

import { useStore } from '@/lib/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MIME_TYPES = [
  { value: 'text/plain', label: 'Plain Text' },
  { value: 'application/json', label: 'JSON' },
  { value: 'text/markdown', label: 'Markdown' },
  { value: 'text/html', label: 'HTML' },
];

export function ResourceConfigPanel() {
  const { selectedNodeId, resources, updateResource, deleteResource, selectNode } = useStore();
  const selectedResource = resources.find(resource => resource.id === selectedNodeId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [uri, setUri] = useState('');
  const [mimeType, setMimeType] = useState('text/plain');

  useEffect(() => {
    if (selectedResource) {
      setName(selectedResource.name);
      setDescription(selectedResource.description);
      setUri(selectedResource.uri);
      setMimeType(selectedResource.mimeType);
    }
  }, [selectedResource]);

  const handleSave = () => {
    if (selectedNodeId) {
      updateResource(selectedNodeId, {
        name,
        description,
        uri,
        mimeType,
      });
    }
  };

  const handleDelete = () => {
    if (selectedNodeId && confirm('Delete this resource?')) {
      deleteResource(selectedNodeId);
      selectNode(null);
    }
  };

  return (
    <AnimatePresence>
      {selectedResource && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-16 bottom-0 w-full sm:w-[400px] surface-overlay border-l border-[var(--border-default)] z-50 flex flex-col"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-[var(--border-default)] flex items-center justify-between">
            <h3 className="font-semibold text-[var(--text-primary)]">Configure Resource</h3>
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
            {/* Resource Name */}
            <div className="space-y-3">
              <Label htmlFor="name" className="text-[var(--text-secondary)]">Resource Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., config_file"
                className="bg-[var(--bg-elevated)] border-[var(--border-default)] focus:border-[var(--accent)]"
              />
            </div>

            {/* Resource Description */}
            <div className="space-y-3">
              <Label htmlFor="description" className="text-[var(--text-secondary)]">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this resource provide?"
                rows={3}
                className="bg-[var(--bg-elevated)] border-[var(--border-default)] focus:border-[var(--accent)]"
              />
            </div>

            {/* URI */}
            <div className="space-y-3">
              <Label htmlFor="uri" className="text-[var(--text-secondary)]">URI</Label>
              <Input
                id="uri"
                value={uri}
                onChange={(e) => setUri(e.target.value)}
                placeholder="e.g., file://config.json, db://users/schema, api://endpoint"
                className="bg-[var(--bg-elevated)] border-[var(--border-default)] focus:border-[var(--accent)]"
              />
              <p className="text-xs text-[var(--text-tertiary)]">
                Examples: file://README.md, db://users/schema, api://v1/status
              </p>
            </div>

            {/* MIME Type */}
            <div className="space-y-3">
              <Label htmlFor="mimeType" className="text-[var(--text-secondary)]">MIME Type</Label>
              <Select
                value={mimeType}
                onValueChange={setMimeType}
              >
                <SelectTrigger className="bg-[var(--bg-elevated)] border-[var(--border-default)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="surface-overlay">
                  {MIME_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              Delete Resource
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
