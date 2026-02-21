'use client';

import { useState } from 'react';
import { CanvasPanel } from '@/components/canvas/CanvasPanel';
import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { ToolConfigPanel } from '@/components/config/ToolConfigPanel';
import { Button } from '@/components/ui/button';
import { Download, Github } from 'lucide-react';
import { useStore } from '@/lib/store/useStore';
import { generateMCPServer } from '@/lib/generators/mcpServerGenerator';
import confetti from 'canvas-confetti';

export default function Home() {
  const { serverConfig } = useStore();
  const [showConfig, setShowConfig] = useState(false);

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
      <header className="h-16 border-b border-border flex items-center justify-between px-6 glass-panel">
        <div className="flex items-center gap-3">
          <div className="text-2xl">⚡</div>
          <div>
            <h1 className="text-xl font-bold">MCP Server Studio</h1>
            <p className="text-xs text-muted-foreground">Visual MCP Server Builder</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://github.com/modelcontextprotocol/specification', '_blank')}
          >
            <Github className="w-4 h-4 mr-2" />
            MCP Docs
          </Button>
          <Button
            onClick={handleExport}
            className="glow-primary"
            disabled={serverConfig.tools.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Server
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Panel */}
        <div className="flex-1 relative">
          <CanvasPanel />
        </div>

        {/* Preview Panel */}
        <div className="w-[500px] border-l border-border">
          <PreviewPanel />
        </div>
      </div>

      {/* Tool Config Panel (slides in when node selected) */}
      <ToolConfigPanel />
    </div>
  );
}
