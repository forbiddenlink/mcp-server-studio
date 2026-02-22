'use client';

import { useState } from 'react';
import { CanvasPanel } from '@/components/canvas/CanvasPanel';
import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { ToolConfigPanel } from '@/components/config/ToolConfigPanel';
import { Button } from '@/components/ui/button';
import { Download, Github, Zap, Code2, X } from 'lucide-react';
import { useStore } from '@/lib/store/useStore';
import { generateMCPServer } from '@/lib/generators/mcpServerGenerator';
import confetti from 'canvas-confetti';

export default function Home() {
  const { serverConfig } = useStore();
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const handleExport = () => {
    const code = generateMCPServer(serverConfig);
    const blob = new Blob([code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${serverConfig.name}.ts`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Celebration confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#8b5cf6', '#10b981'],
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--bg-primary)] text-foreground overflow-hidden">
      {/* Header */}
      <header className="h-14 sm:h-16 border-b border-[var(--border-default)] flex items-center justify-between px-3 sm:px-6 bg-[var(--bg-surface)]">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">MCP Server Studio</h1>
            <p className="text-xs text-[var(--text-tertiary)]">Visual MCP Server Builder</p>
          </div>
          <h1 className="sm:hidden text-base font-semibold text-[var(--text-primary)]">MCP Studio</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile preview toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobilePreview(!showMobilePreview)}
            className="lg:hidden"
          >
            <Code2 className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Preview</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://github.com/modelcontextprotocol/specification', '_blank')}
            className="hidden sm:flex"
          >
            <Github className="w-4 h-4 mr-2" />
            MCP Docs
          </Button>
          <Button
            onClick={handleExport}
            size="sm"
            className="hover:shadow-[var(--shadow-glow)] transition-shadow"
            disabled={serverConfig.tools.length === 0}
          >
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Export Server</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Canvas Panel */}
        <div className="flex-1 relative">
          <CanvasPanel />
        </div>

        {/* Preview Panel - Desktop */}
        <div className="hidden lg:block w-[500px] border-l border-border">
          <PreviewPanel />
        </div>

        {/* Preview Panel - Mobile Slide-up */}
        {showMobilePreview && (
          <div className="lg:hidden fixed inset-0 top-14 z-40 bg-[var(--bg-base)] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
              <h2 className="font-semibold text-[var(--text-primary)]">Preview</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobilePreview(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <PreviewPanel />
            </div>
          </div>
        )}
      </div>

      {/* Tool Config Panel (slides in when node selected) */}
      <ToolConfigPanel />
    </div>
  );
}
