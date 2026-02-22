'use client';

import * as React from 'react';
import { useState, useCallback } from 'react';
import { X, Upload, Link, AlertCircle, CheckCircle, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { parseOpenApiSpec, fetchAndParseOpenApiSpec, ParseResult } from '@/lib/importers/openApiImporter';
import { MCPTool } from '@/lib/types';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (tools: MCPTool[]) => void;
}

type DialogState = 'input' | 'preview' | 'loading';

export function ImportDialog({ isOpen, onClose, onImport }: ImportDialogProps) {
  const [state, setState] = useState<DialogState>('input');
  const [pasteValue, setPasteValue] = useState('');
  const [urlValue, setUrlValue] = useState('');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('paste');

  const handleClose = useCallback(() => {
    setState('input');
    setPasteValue('');
    setUrlValue('');
    setParseResult(null);
    setSelectedTools(new Set());
    onClose();
  }, [onClose]);

  const handleParse = useCallback(async () => {
    setState('loading');

    let result: ParseResult;

    if (activeTab === 'paste') {
      result = parseOpenApiSpec(pasteValue);
    } else {
      result = await fetchAndParseOpenApiSpec(urlValue);
    }

    setParseResult(result);
    if (result.success) {
      setSelectedTools(new Set(result.tools.map(t => t.id)));
    }
    setState('preview');
  }, [activeTab, pasteValue, urlValue]);

  const handleImportSelected = useCallback(() => {
    if (!parseResult) return;

    const toolsToImport = parseResult.tools.filter(t => selectedTools.has(t.id));
    onImport(toolsToImport);
    handleClose();
  }, [parseResult, selectedTools, onImport, handleClose]);

  const toggleTool = useCallback((id: string) => {
    setSelectedTools(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (parseResult) {
      setSelectedTools(new Set(parseResult.tools.map(t => t.id)));
    }
  }, [parseResult]);

  const deselectAll = useCallback(() => {
    setSelectedTools(new Set());
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl max-h-[80vh] mx-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-default)] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Import from OpenAPI
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {state === 'input' && 'Paste your OpenAPI spec or provide a URL'}
              {state === 'loading' && 'Parsing specification...'}
              {state === 'preview' && 'Select tools to import'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {state === 'input' && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="paste" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Paste Spec
                </TabsTrigger>
                <TabsTrigger value="url" className="gap-2">
                  <Link className="w-4 h-4" />
                  From URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="paste" className="mt-0">
                <Textarea
                  value={pasteValue}
                  onChange={(e) => setPasteValue(e.target.value)}
                  placeholder={`Paste your OpenAPI/Swagger spec here (JSON or YAML)...

Example:
{
  "openapi": "3.0.0",
  "info": { "title": "My API", "version": "1.0.0" },
  "paths": {
    "/users": {
      "get": {
        "operationId": "getUsers",
        "summary": "List all users"
      }
    }
  }
}`}
                  className="min-h-[300px] font-mono text-sm"
                />
              </TabsContent>

              <TabsContent value="url" className="mt-0">
                <div className="space-y-4">
                  <Input
                    value={urlValue}
                    onChange={(e) => setUrlValue(e.target.value)}
                    placeholder="https://api.example.com/openapi.json"
                    type="url"
                  />
                  <p className="text-sm text-[var(--text-tertiary)]">
                    Enter the URL to your OpenAPI/Swagger specification file (JSON or YAML).
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {state === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin mb-4" />
              <p className="text-[var(--text-secondary)]">Parsing specification...</p>
            </div>
          )}

          {state === 'preview' && parseResult && (
            <div className="space-y-4">
              {/* Errors */}
              {parseResult.errors.length > 0 && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-500">Errors</p>
                      <ul className="mt-1 text-sm text-red-400 list-disc list-inside">
                        {parseResult.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {parseResult.warnings.length > 0 && (
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-500">Warnings</p>
                      <ul className="mt-1 text-sm text-yellow-400 list-disc list-inside">
                        {parseResult.warnings.slice(0, 5).map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                        {parseResult.warnings.length > 5 && (
                          <li>...and {parseResult.warnings.length - 5} more</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Success message */}
              {parseResult.success && (
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <p className="text-emerald-500">
                      Found {parseResult.tools.length} tool{parseResult.tools.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )}

              {/* Tool selection */}
              {parseResult.tools.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[var(--text-secondary)]">
                      {selectedTools.size} of {parseResult.tools.length} selected
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={selectAll}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={deselectAll}
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>

                  <div className="border border-[var(--border-default)] rounded-lg overflow-hidden">
                    <div className="max-h-[300px] overflow-y-auto">
                      {parseResult.tools.map((tool) => (
                        <div
                          key={tool.id}
                          onClick={() => toggleTool(tool.id)}
                          className={cn(
                            'flex items-start gap-3 p-3 cursor-pointer border-b border-[var(--border-default)] last:border-b-0',
                            'hover:bg-[var(--bg-hover)] transition-colors',
                            selectedTools.has(tool.id) && 'bg-[var(--accent-muted)]'
                          )}
                        >
                          <div className={cn(
                            'w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5',
                            selectedTools.has(tool.id)
                              ? 'bg-[var(--accent)] border-[var(--accent)]'
                              : 'border-[var(--border-strong)]'
                          )}>
                            {selectedTools.has(tool.id) && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[var(--text-primary)]">
                              {tool.name}
                            </p>
                            <p className="text-sm text-[var(--text-secondary)] truncate">
                              {tool.description}
                            </p>
                            <p className="text-xs text-[var(--text-tertiary)] mt-1">
                              {tool.parameters.length} parameter{tool.parameters.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border-default)]">
          {state === 'input' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleParse}
                disabled={
                  (activeTab === 'paste' && !pasteValue.trim()) ||
                  (activeTab === 'url' && !urlValue.trim())
                }
              >
                Parse Spec
              </Button>
            </>
          )}

          {state === 'preview' && (
            <>
              <Button
                variant="outline"
                onClick={() => setState('input')}
              >
                Back
              </Button>
              <Button
                onClick={handleImportSelected}
                disabled={selectedTools.size === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add {selectedTools.size} Tool{selectedTools.size !== 1 ? 's' : ''}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
