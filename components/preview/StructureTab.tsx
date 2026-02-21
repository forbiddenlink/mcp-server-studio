'use client';

import { useStore } from '@/lib/store/useStore';
import { generateManifest } from '@/lib/generators/manifestGenerator';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function StructureTab() {
  const { serverConfig } = useStore();
  const [copied, setCopied] = useState(false);
  const manifest = generateManifest(serverConfig);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Server Manifest</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={serverConfig.tools.length === 0}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>

      {serverConfig.tools.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center">
          <div className="text-muted-foreground">
            <div className="text-4xl mb-4">📋</div>
            <p>No tools yet</p>
            <p className="text-sm mt-2">Add tools to see the server manifest</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <pre className="text-xs p-4 bg-[var(--bg-primary)] rounded-lg border border-border">
            <code>{JSON.stringify(manifest, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
