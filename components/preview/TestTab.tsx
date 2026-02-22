'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store/useStore';
import {
  executeTool,
  testResource,
  testPrompt,
  runBatchValidation,
  TestResult,
  BatchTestResult,
} from '@/lib/simulators/mcpTestSimulator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Play,
  FlaskConical,
  Wrench,
  FileText,
  MessageSquareText,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlayCircle,
  ArrowLeft,
} from 'lucide-react';
import { MCPTool, MCPResource, MCPPrompt, MCPParameter } from '@/lib/types';

type ItemType = 'tool' | 'resource' | 'prompt';

interface SelectedItem {
  type: ItemType;
  item: MCPTool | MCPResource | MCPPrompt;
}

export function TestTab() {
  const { tools, resources, prompts } = useStore();
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [batchResult, setBatchResult] = useState<BatchTestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const hasItems = tools.length > 0 || resources.length > 0 || prompts.length > 0;

  const handleSelectItem = (type: ItemType, item: MCPTool | MCPResource | MCPPrompt) => {
    setSelectedItem({ type, item });
    setFormValues({});
    setTestResult(null);
  };

  const handleBack = () => {
    setSelectedItem(null);
    setFormValues({});
    setTestResult(null);
  };

  const handleInputChange = (name: string, value: unknown, type: string) => {
    let parsedValue: unknown = value;

    if (type === 'number') {
      parsedValue = value === '' ? undefined : Number(value);
    } else if (type === 'boolean') {
      parsedValue = value === 'true';
    } else if (type === 'array' || type === 'object') {
      try {
        parsedValue = value ? JSON.parse(value as string) : undefined;
      } catch {
        parsedValue = value;
      }
    }

    setFormValues((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleTest = async () => {
    if (!selectedItem) return;

    setIsRunning(true);
    setTestResult(null);

    // Simulate async execution
    await new Promise((resolve) => setTimeout(resolve, 300));

    let result: TestResult;

    switch (selectedItem.type) {
      case 'tool':
        result = executeTool(selectedItem.item as MCPTool, formValues);
        break;
      case 'resource':
        result = testResource(selectedItem.item as MCPResource);
        break;
      case 'prompt':
        result = testPrompt(selectedItem.item as MCPPrompt, formValues);
        break;
    }

    setTestResult(result);
    setIsRunning(false);
  };

  const handleTestAll = async () => {
    setIsRunning(true);
    setBatchResult(null);
    setSelectedItem(null);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = runBatchValidation(tools, resources, prompts);
    setBatchResult(result);
    setIsRunning(false);
  };

  // Get parameters for the selected item
  const getParameters = (): MCPParameter[] => {
    if (!selectedItem) return [];

    if (selectedItem.type === 'tool') {
      return (selectedItem.item as MCPTool).parameters;
    }
    if (selectedItem.type === 'prompt') {
      return (selectedItem.item as MCPPrompt).arguments;
    }
    return [];
  };

  if (!hasItems) {
    return (
      <div className="h-full flex items-center justify-center text-center px-6">
        <div>
          <div className="w-12 h-12 rounded-xl bg-[var(--accent-muted)] flex items-center justify-center mx-auto mb-4">
            <FlaskConical className="w-6 h-6 text-[var(--accent)]" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">No items to test</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Add tools, resources, or prompts to start testing
          </p>
        </div>
      </div>
    );
  }

  // Batch results view
  if (batchResult) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setBatchResult(null)}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h3 className="font-semibold text-[var(--text-primary)]">Validation Results</h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--success)]">{batchResult.summary.passed} passed</span>
            <span className="text-[var(--text-tertiary)]">/</span>
            <span className="text-[var(--error)]">{batchResult.summary.failed} failed</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto space-y-4">
          {/* Tools */}
          {batchResult.tools.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-[var(--text-tertiary)] mb-2 flex items-center gap-2">
                <Wrench className="w-3 h-3" /> Tools
              </h4>
              <div className="space-y-2">
                {batchResult.tools.map(({ item, result }) => (
                  <BatchResultItem key={item.id} name={item.name} result={result} />
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          {batchResult.resources.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-[var(--text-tertiary)] mb-2 flex items-center gap-2">
                <FileText className="w-3 h-3" /> Resources
              </h4>
              <div className="space-y-2">
                {batchResult.resources.map(({ item, result }) => (
                  <BatchResultItem key={item.id} name={item.name} result={result} />
                ))}
              </div>
            </div>
          )}

          {/* Prompts */}
          {batchResult.prompts.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-[var(--text-tertiary)] mb-2 flex items-center gap-2">
                <MessageSquareText className="w-3 h-3" /> Prompts
              </h4>
              <div className="space-y-2">
                {batchResult.prompts.map(({ item, result }) => (
                  <BatchResultItem key={item.id} name={item.name} result={result} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Item detail / test view
  if (selectedItem) {
    const params = getParameters();

    return (
      <div className="h-full flex flex-col p-4">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleBack}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <ItemIcon type={selectedItem.type} />
            <h3 className="font-semibold text-[var(--text-primary)]">
              {selectedItem.item.name}
            </h3>
          </div>
        </div>

        <div className="flex-1 overflow-auto space-y-4">
          {/* Description */}
          <p className="text-xs text-[var(--text-secondary)]">
            {selectedItem.item.description}
          </p>

          {/* Resource-specific info */}
          {selectedItem.type === 'resource' && (
            <div className="space-y-2">
              <div className="text-xs">
                <span className="text-[var(--text-tertiary)]">URI: </span>
                <code className="text-[var(--accent)]">
                  {(selectedItem.item as MCPResource).uri}
                </code>
              </div>
              <div className="text-xs">
                <span className="text-[var(--text-tertiary)]">MIME Type: </span>
                <code className="text-[var(--text-secondary)]">
                  {(selectedItem.item as MCPResource).mimeType}
                </code>
              </div>
            </div>
          )}

          {/* Parameters form */}
          {params.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-[var(--text-tertiary)]">
                {selectedItem.type === 'tool' ? 'Parameters' : 'Arguments'}
              </h4>
              {params.map((param) => (
                <ParameterInput
                  key={param.name}
                  param={param}
                  value={formValues[param.name]}
                  onChange={(value) => handleInputChange(param.name, value, param.type)}
                  error={testResult?.validationErrors?.find((e) => e.field === param.name)?.message}
                />
              ))}
            </div>
          )}

          {/* Test result */}
          {testResult && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-[var(--text-tertiary)]">Result</h4>
              <TestResultDisplay result={testResult} />
            </div>
          )}
        </div>

        {/* Test button */}
        <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
          <Button
            onClick={handleTest}
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <PlayCircle className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Test
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Item list view
  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[var(--text-primary)]">Test Inspector</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleTestAll}
          disabled={isRunning}
          className="text-xs"
        >
          {isRunning ? (
            <>
              <PlayCircle className="w-3 h-3 mr-1 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              <Play className="w-3 h-3 mr-1" />
              Test All
            </>
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-auto space-y-4">
        {/* Tools */}
        {tools.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-[var(--text-tertiary)] mb-2 flex items-center gap-2">
              <Wrench className="w-3 h-3" /> Tools ({tools.length})
            </h4>
            <div className="space-y-1">
              {tools.map((tool) => (
                <ItemRow
                  key={tool.id}
                  type="tool"
                  item={tool}
                  onClick={() => handleSelectItem('tool', tool)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        {resources.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-[var(--text-tertiary)] mb-2 flex items-center gap-2">
              <FileText className="w-3 h-3" /> Resources ({resources.length})
            </h4>
            <div className="space-y-1">
              {resources.map((resource) => (
                <ItemRow
                  key={resource.id}
                  type="resource"
                  item={resource}
                  onClick={() => handleSelectItem('resource', resource)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Prompts */}
        {prompts.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-[var(--text-tertiary)] mb-2 flex items-center gap-2">
              <MessageSquareText className="w-3 h-3" /> Prompts ({prompts.length})
            </h4>
            <div className="space-y-1">
              {prompts.map((prompt) => (
                <ItemRow
                  key={prompt.id}
                  type="prompt"
                  item={prompt}
                  onClick={() => handleSelectItem('prompt', prompt)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components

function ItemIcon({ type }: { type: ItemType }) {
  switch (type) {
    case 'tool':
      return <Wrench className="w-4 h-4 text-[var(--accent)]" />;
    case 'resource':
      return <FileText className="w-4 h-4 text-[var(--accent)]" />;
    case 'prompt':
      return <MessageSquareText className="w-4 h-4 text-[var(--accent)]" />;
  }
}

function ItemRow({
  type,
  item,
  onClick,
}: {
  type: ItemType;
  item: MCPTool | MCPResource | MCPPrompt;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-base)] border border-[var(--border-default)] hover:border-[var(--accent)]/30 transition-colors group"
    >
      <ItemIcon type={type} />
      <div className="flex-1 text-left min-w-0">
        <div className="text-sm font-medium text-[var(--text-primary)] truncate">
          {item.name}
        </div>
        <div className="text-xs text-[var(--text-tertiary)] truncate">
          {item.description}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
    </button>
  );
}

function ParameterInput({
  param,
  value,
  onChange,
  error,
}: {
  param: MCPParameter;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}) {
  const inputValue = value !== undefined ? String(value) : '';

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Label className="text-xs text-[var(--text-secondary)]">
          {param.name}
          {param.required && <span className="text-[var(--error)] ml-1">*</span>}
        </Label>
        <span className="text-[10px] text-[var(--text-tertiary)] px-1.5 py-0.5 rounded bg-[var(--bg-base)]">
          {param.type}
        </span>
      </div>
      {param.description && (
        <p className="text-[10px] text-[var(--text-tertiary)]">{param.description}</p>
      )}
      {param.type === 'boolean' ? (
        <select
          value={inputValue || 'false'}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-8 px-2 text-xs rounded-md bg-[var(--bg-base)] border border-[var(--border-default)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
        >
          <option value="false">false</option>
          <option value="true">true</option>
        </select>
      ) : param.type === 'array' || param.type === 'object' ? (
        <textarea
          value={inputValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={param.type === 'array' ? '["item1", "item2"]' : '{"key": "value"}'}
          className="w-full min-h-[60px] px-2 py-1.5 text-xs rounded-md bg-[var(--bg-base)] border border-[var(--border-default)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none resize-none font-mono"
        />
      ) : (
        <Input
          type={param.type === 'number' ? 'number' : 'text'}
          value={inputValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${param.name}...`}
          className="h-8 text-xs bg-[var(--bg-base)] border-[var(--border-default)] focus:border-[var(--accent)]"
        />
      )}
      {error && (
        <p className="text-[10px] text-[var(--error)] flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function TestResultDisplay({ result }: { result: TestResult }) {
  return (
    <div
      className={`p-3 rounded-lg border ${
        result.success
          ? 'bg-[var(--success)]/10 border-[var(--success)]/30'
          : 'bg-[var(--error)]/10 border-[var(--error)]/30'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {result.success ? (
          <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
        ) : (
          <XCircle className="w-4 h-4 text-[var(--error)]" />
        )}
        <span
          className={`text-sm font-medium ${
            result.success ? 'text-[var(--success)]' : 'text-[var(--error)]'
          }`}
        >
          {result.success ? 'Success' : 'Failed'}
        </span>
      </div>

      {result.error && !result.validationErrors && (
        <p className="text-xs text-[var(--error)]">{result.error}</p>
      )}

      {result.validationErrors && result.validationErrors.length > 0 && (
        <div className="space-y-1">
          {result.validationErrors.map((err, i) => (
            <p key={i} className="text-xs text-[var(--error)]">
              {err.field}: {err.message}
            </p>
          ))}
        </div>
      )}

      {result.success && result.result !== undefined && (
        <pre className="text-xs text-[var(--text-secondary)] overflow-auto max-h-48 mt-2 p-2 bg-[var(--bg-base)] rounded font-mono">
          {JSON.stringify(result.result, null, 2)}
        </pre>
      )}
    </div>
  );
}

function BatchResultItem({ name, result }: { name: string; result: TestResult }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`p-2 rounded-lg border ${
        result.success
          ? 'bg-[var(--bg-elevated)] border-[var(--border-default)]'
          : 'bg-[var(--error)]/5 border-[var(--error)]/30'
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2"
      >
        {result.success ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-[var(--error)]" />
        )}
        <span className="flex-1 text-left text-sm text-[var(--text-primary)]">{name}</span>
        <ChevronRight
          className={`w-3.5 h-3.5 text-[var(--text-tertiary)] transition-transform ${
            expanded ? 'rotate-90' : ''
          }`}
        />
      </button>

      {expanded && result.validationErrors && result.validationErrors.length > 0 && (
        <div className="mt-2 pt-2 border-t border-[var(--border-default)] space-y-1">
          {result.validationErrors.map((err, i) => (
            <p key={i} className="text-xs text-[var(--error)]">
              {err.field}: {err.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
