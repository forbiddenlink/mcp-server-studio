'use client';

import { useState } from 'react';
import { ChevronDown, Sparkles, MessageSquare, Clock } from 'lucide-react';
import { SamplingConfig, ElicitationConfig, TasksConfig } from '@/lib/types';
import { SamplingConfigPanel } from './SamplingConfigPanel';
import { ElicitationConfigPanel } from './ElicitationConfigPanel';

interface CapabilitiesSectionProps {
  sampling?: SamplingConfig;
  elicitation?: ElicitationConfig;
  tasks?: TasksConfig;
  onSamplingChange: (config: SamplingConfig | undefined) => void;
  onElicitationChange: (config: ElicitationConfig | undefined) => void;
  onTasksChange: (config: TasksConfig | undefined) => void;
}

const DEFAULT_SAMPLING: SamplingConfig = {
  enabled: true,
  maxTokens: 1024,
  temperature: 0.7,
  modelHint: 'balanced',
};

const DEFAULT_ELICITATION: ElicitationConfig = {
  enabled: true,
  mode: 'form',
  message: '',
  formFields: [],
};

const DEFAULT_TASKS: TasksConfig = {
  enabled: true,
  ttl: 300000, // 5 minutes
};

export function CapabilitiesSection({
  sampling,
  elicitation,
  tasks,
  onSamplingChange,
  onElicitationChange,
  onTasksChange,
}: CapabilitiesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(
    Boolean(sampling?.enabled || elicitation?.enabled || tasks?.enabled)
  );

  const handleSamplingToggle = (enabled: boolean) => {
    if (enabled) {
      onSamplingChange(sampling || DEFAULT_SAMPLING);
    } else {
      onSamplingChange(sampling ? { ...sampling, enabled: false } : undefined);
    }
  };

  const handleElicitationToggle = (enabled: boolean) => {
    if (enabled) {
      onElicitationChange(elicitation || DEFAULT_ELICITATION);
    } else {
      onElicitationChange(elicitation ? { ...elicitation, enabled: false } : undefined);
    }
  };

  const handleTasksToggle = (enabled: boolean) => {
    if (enabled) {
      onTasksChange(tasks || DEFAULT_TASKS);
    } else {
      onTasksChange(tasks ? { ...tasks, enabled: false } : undefined);
    }
  };

  const enabledCount = [sampling?.enabled, elicitation?.enabled, tasks?.enabled].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Advanced Capabilities
          </span>
          {enabledCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
              {enabledCount}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isExpanded && (
        <div className="space-y-4">
          {/* Sampling Toggle */}
          <div className="surface-elevated p-4 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  Uses Sampling
                </span>
              </div>
              <input
                type="checkbox"
                checked={sampling?.enabled || false}
                onChange={(e) => handleSamplingToggle(e.target.checked)}
                className="rounded border-[var(--border-default)] bg-[var(--bg-surface)] checked:bg-[var(--accent)] checked:border-[var(--accent)]"
              />
            </label>
            <p className="text-xs text-[var(--text-tertiary)]">
              Request LLM inference from the client during tool execution
            </p>
            {sampling?.enabled && (
              <div className="pt-3 border-t border-[var(--border-default)]">
                <SamplingConfigPanel
                  config={sampling}
                  onChange={onSamplingChange}
                />
              </div>
            )}
          </div>

          {/* Elicitation Toggle */}
          <div className="surface-elevated p-4 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  Uses Elicitation
                </span>
              </div>
              <input
                type="checkbox"
                checked={elicitation?.enabled || false}
                onChange={(e) => handleElicitationToggle(e.target.checked)}
                className="rounded border-[var(--border-default)] bg-[var(--bg-surface)] checked:bg-[var(--accent)] checked:border-[var(--accent)]"
              />
            </label>
            <p className="text-xs text-[var(--text-tertiary)]">
              Request additional input from the user during tool execution
            </p>
            {elicitation?.enabled && (
              <div className="pt-3 border-t border-[var(--border-default)]">
                <ElicitationConfigPanel
                  config={elicitation}
                  onChange={onElicitationChange}
                />
              </div>
            )}
          </div>

          {/* Tasks Toggle */}
          <div className="surface-elevated p-4 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  Long-running (Tasks)
                </span>
                <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-500/10 text-amber-400 uppercase">
                  Experimental
                </span>
              </div>
              <input
                type="checkbox"
                checked={tasks?.enabled || false}
                onChange={(e) => handleTasksToggle(e.target.checked)}
                className="rounded border-[var(--border-default)] bg-[var(--bg-surface)] checked:bg-[var(--accent)] checked:border-[var(--accent)]"
              />
            </label>
            <p className="text-xs text-[var(--text-tertiary)]">
              Enable async execution with progress tracking for long-running operations
            </p>
            {tasks?.enabled && (
              <div className="pt-3 border-t border-[var(--border-default)] space-y-2">
                <div className="space-y-2">
                  <label htmlFor="tasks-ttl" className="text-xs text-[var(--text-secondary)]">
                    TTL (milliseconds)
                  </label>
                  <input
                    id="tasks-ttl"
                    type="number"
                    min={0}
                    step={1000}
                    value={tasks.ttl ?? 300000}
                    onChange={(e) => onTasksChange({ ...tasks, ttl: parseInt(e.target.value) || 300000 })}
                    placeholder="300000"
                    className="w-full px-3 py-2 text-sm rounded-md bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)]"
                  />
                  <p className="text-xs text-[var(--text-tertiary)]">
                    How long the task can run before timing out (default: 5 minutes)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
