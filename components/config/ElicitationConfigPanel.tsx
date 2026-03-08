'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ElicitationConfig, ElicitationFormField } from '@/lib/types';
import { Plus, Trash2 } from 'lucide-react';

interface ElicitationConfigPanelProps {
  config: ElicitationConfig;
  onChange: (config: ElicitationConfig) => void;
}

export function ElicitationConfigPanel({ config, onChange }: ElicitationConfigPanelProps) {
  const handleChange = (updates: Partial<ElicitationConfig>) => {
    onChange({ ...config, ...updates });
  };

  const handleAddField = () => {
    const newField: ElicitationFormField = {
      name: '',
      type: 'string',
      description: '',
      required: false,
    };
    handleChange({ formFields: [...(config.formFields || []), newField] });
  };

  const handleUpdateField = (index: number, updates: Partial<ElicitationFormField>) => {
    const newFields = [...(config.formFields || [])];
    newFields[index] = { ...newFields[index], ...updates };
    handleChange({ formFields: newFields });
  };

  const handleDeleteField = (index: number) => {
    const newFields = (config.formFields || []).filter((_, i) => i !== index);
    handleChange({ formFields: newFields });
  };

  return (
    <div className="space-y-4">
      {/* Mode Selection */}
      <div className="space-y-2">
        <Label className="text-[var(--text-secondary)] text-sm">Input Mode</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleChange({ mode: 'form' })}
            className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
              config.mode === 'form'
                ? 'bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]'
                : 'bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
            }`}
          >
            Form
          </button>
          <button
            type="button"
            onClick={() => handleChange({ mode: 'url' })}
            className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
              config.mode === 'url'
                ? 'bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]'
                : 'bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
            }`}
          >
            URL
          </button>
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="elicitation-message" className="text-[var(--text-secondary)] text-sm">
          Message <span className="text-[var(--error)]">*</span>
        </Label>
        <Textarea
          id="elicitation-message"
          value={config.message}
          onChange={(e) => handleChange({ message: e.target.value })}
          placeholder="Prompt message shown to the user..."
          rows={2}
          className="bg-[var(--bg-surface)] border-[var(--border-default)]"
        />
        <p className="text-xs text-[var(--text-tertiary)]">
          Message displayed when requesting user input
        </p>
      </div>

      {/* Form Mode Fields */}
      {config.mode === 'form' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[var(--text-secondary)] text-sm">Form Fields</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddField}
              className="text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Field
            </Button>
          </div>

          {(config.formFields || []).length === 0 ? (
            <div className="text-center py-6 border border-dashed border-[var(--border-default)] rounded-lg">
              <p className="text-sm text-[var(--text-secondary)]">No form fields</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Add fields to collect user input</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(config.formFields || []).map((field, index) => (
                <div key={index} className="surface-elevated p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-tertiary)]">
                      Field {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleDeleteField(index)}
                      className="text-[var(--text-tertiary)] hover:text-[var(--error)]"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  <Input
                    placeholder="Field name"
                    value={field.name}
                    onChange={(e) => handleUpdateField(index, { name: e.target.value })}
                    className="bg-[var(--bg-surface)] border-[var(--border-default)]"
                  />

                  <Select
                    value={field.type}
                    onValueChange={(value: 'string' | 'number' | 'boolean') =>
                      handleUpdateField(index, { type: value })
                    }
                  >
                    <SelectTrigger className="bg-[var(--bg-surface)] border-[var(--border-default)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="surface-overlay">
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Field description"
                    value={field.description}
                    onChange={(e) => handleUpdateField(index, { description: e.target.value })}
                    className="bg-[var(--bg-surface)] border-[var(--border-default)]"
                  />

                  <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => handleUpdateField(index, { required: e.target.checked })}
                      className="rounded border-[var(--border-default)] bg-[var(--bg-surface)] checked:bg-[var(--accent)] checked:border-[var(--accent)]"
                    />
                    <span>Required</span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* URL Mode */}
      {config.mode === 'url' && (
        <div className="space-y-2">
          <Label htmlFor="elicitation-url" className="text-[var(--text-secondary)] text-sm">
            URL <span className="text-[var(--error)]">*</span>
          </Label>
          <Input
            id="elicitation-url"
            type="url"
            value={config.url || ''}
            onChange={(e) => handleChange({ url: e.target.value })}
            placeholder="https://example.com/form"
            className="bg-[var(--bg-surface)] border-[var(--border-default)]"
          />
          <p className="text-xs text-[var(--text-tertiary)]">
            External URL where user will provide input
          </p>
        </div>
      )}
    </div>
  );
}
