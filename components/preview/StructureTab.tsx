'use client';

import { useStore } from '@/lib/store/useStore';
import { generateManifest } from '@/lib/generators/manifestGenerator';
import { Button } from '@/components/ui/button';
import { Copy, Check, ClipboardList } from 'lucide-react';
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
        <h3 className="font-semibold text-[var(--text-primary)]">Server Manifest</h3>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={handleCopy}
          disabled={serverConfig.tools.length === 0}
          className={copied ? 'text-[var(--success)] border-[var(--success)]/30' : ''}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>

      {serverConfig.tools.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center px-6">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[var(--accent-muted)] flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-6 h-6 text-[var(--accent)]" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">No tools yet</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Add tools to see the server manifest</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <pre className="text-xs p-4 bg-[var(--bg-base)] rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] leading-relaxed">
            <code>{JSON.stringify(manifest, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
