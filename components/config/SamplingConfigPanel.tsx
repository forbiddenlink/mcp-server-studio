'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SamplingConfig } from '@/lib/types';

interface SamplingConfigPanelProps {
  config: SamplingConfig;
  onChange: (config: SamplingConfig) => void;
}

const MODEL_HINTS = [
  { value: 'fastest', label: 'Fastest', description: 'Prioritize speed' },
  { value: 'balanced', label: 'Balanced', description: 'Balance speed and quality' },
  { value: 'smartest', label: 'Smartest', description: 'Prioritize quality' },
];

export function SamplingConfigPanel({ config, onChange }: SamplingConfigPanelProps) {
  const handleChange = (updates: Partial<SamplingConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      {/* Max Tokens */}
      <div className="space-y-2">
        <Label htmlFor="sampling-max-tokens" className="text-[var(--text-secondary)] text-sm">
          Max Tokens <span className="text-[var(--error)]">*</span>
        </Label>
        <Input
          id="sampling-max-tokens"
          type="number"
          min={1}
          max={100000}
          value={config.maxTokens}
          onChange={(e) => handleChange({ maxTokens: parseInt(e.target.value) || 1024 })}
          placeholder="1024"
          className="bg-[var(--bg-surface)] border-[var(--border-default)]"
        />
        <p className="text-xs text-[var(--text-tertiary)]">
          Maximum tokens for LLM response (prevents runaway)
        </p>
      </div>

      {/* Temperature */}
      <div className="space-y-2">
        <Label htmlFor="sampling-temperature" className="text-[var(--text-secondary)] text-sm">
          Temperature
        </Label>
        <div className="flex items-center gap-3">
          <input
            id="sampling-temperature"
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={config.temperature ?? 0.7}
            onChange={(e) => handleChange({ temperature: parseFloat(e.target.value) })}
            className="flex-1 h-2 bg-[var(--bg-elevated)] rounded-full appearance-none cursor-pointer accent-[var(--accent)]"
          />
          <span className="text-sm text-[var(--text-secondary)] w-10 text-right">
            {(config.temperature ?? 0.7).toFixed(1)}
          </span>
        </div>
        <p className="text-xs text-[var(--text-tertiary)]">
          Controls randomness: 0 = deterministic, 2 = creative
        </p>
      </div>

      {/* Model Hint */}
      <div className="space-y-2">
        <Label htmlFor="sampling-model-hint" className="text-[var(--text-secondary)] text-sm">
          Model Hint
        </Label>
        <Select
          value={config.modelHint || 'balanced'}
          onValueChange={(value: 'fastest' | 'balanced' | 'smartest') => handleChange({ modelHint: value })}
        >
          <SelectTrigger className="bg-[var(--bg-surface)] border-[var(--border-default)]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="surface-overlay">
            {MODEL_HINTS.map(hint => (
              <SelectItem key={hint.value} value={hint.value}>
                <div className="flex flex-col">
                  <span>{hint.label}</span>
                  <span className="text-xs text-[var(--text-tertiary)]">{hint.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-[var(--text-tertiary)]">
          Suggests model selection preference to clients
        </p>
      </div>

      {/* System Prompt */}
      <div className="space-y-2">
        <Label htmlFor="sampling-system-prompt" className="text-[var(--text-secondary)] text-sm">
          System Prompt
        </Label>
        <Textarea
          id="sampling-system-prompt"
          value={config.systemPrompt || ''}
          onChange={(e) => handleChange({ systemPrompt: e.target.value })}
          placeholder="Optional system prompt for the LLM..."
          rows={3}
          className="bg-[var(--bg-surface)] border-[var(--border-default)]"
        />
        <p className="text-xs text-[var(--text-tertiary)]">
          Sets context for the LLM when processing sampling requests
        </p>
      </div>
    </div>
  );
}
