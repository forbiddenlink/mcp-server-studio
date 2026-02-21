'use client';

import { useStore } from '@/lib/store/useStore';
import { generateMCPServer } from '@/lib/generators/mcpServerGenerator';
import { Button } from '@/components/ui/button';
import { Copy, Download, Check } from 'lucide-react';
import { useState } from 'react';
import Editor from '@monaco-editor/react';

export function CodeTab() {
  const { serverConfig } = useStore();
  const [copied, setCopied] = useState(false);
  const code = generateMCPServer(serverConfig);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${serverConfig.name}.ts`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Generated Code</h3>
          <p className="text-xs text-muted-foreground">{serverConfig.name}.ts</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={serverConfig.tools.length === 0}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={serverConfig.tools.length === 0}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {serverConfig.tools.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center">
          <div className="text-muted-foreground">
            <div className="text-4xl mb-4">💻</div>
            <p>No code yet</p>
            <p className="text-sm mt-2">Add tools to generate server code</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden rounded-lg border border-border">
          <Editor
            height="100%"
            defaultLanguage="typescript"
            value={code}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 12,
              lineNumbers: 'on',
              renderLineHighlight: 'none',
              scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
