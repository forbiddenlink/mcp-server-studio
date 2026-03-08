"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { CanvasPanel } from "@/components/canvas/CanvasPanel";
import { PreviewPanel } from "@/components/preview/PreviewPanel";
import { ToolConfigPanel } from "@/components/config/ToolConfigPanel";
import { ResourceConfigPanel } from "@/components/config/ResourceConfigPanel";
import { PromptConfigPanel } from "@/components/config/PromptConfigPanel";
import { ServerConfigPanel } from "@/components/config/ServerConfigPanel";
import { CommandPalette, commandIcons } from "@/components/ui/command-palette";
import { Button } from "@/components/ui/button";
import {
  Download,
  Github,
  Zap,
  Code2,
  X,
  Command,
  Settings,
  ChevronDown,
  FileCode,
  Container,
  Train,
  Rocket,
} from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { toolTemplates } from "@/lib/templates/toolTemplates";
import { MCPTool } from "@/lib/types";
import {
  createExportBundle,
  ExportFormat,
} from "@/lib/generators/exportBundler";
import { createZipBlob } from "@/lib/generators/zipCreator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import confetti from "canvas-confetti";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function Home() {
  const {
    serverConfig,
    tools,
    resources,
    prompts,
    addTool,
    selectNode,
    selectedNodeId,
    copyTool,
    pasteTool,
    duplicateTool,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useStore();

  // Detect selected node type
  const selectedNodeType = useMemo(() => {
    if (!selectedNodeId) return null;
    if (tools.some((t) => t.id === selectedNodeId)) return "tool";
    if (resources.some((r) => r.id === selectedNodeId)) return "resource";
    if (prompts.some((p) => p.id === selectedNodeId)) return "prompt";
    return null;
  }, [selectedNodeId, tools, resources, prompts]);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showServerSettings, setShowServerSettings] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const isMod = e.metaKey || e.ctrlKey;

      // Cmd+K - Command palette
      if (isMod && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }

      // Cmd+C - Copy selected tool
      if (isMod && e.key === "c" && selectedNodeId) {
        e.preventDefault();
        copyTool(selectedNodeId);
      }

      // Cmd+V - Paste tool
      if (isMod && e.key === "v") {
        e.preventDefault();
        pasteTool();
      }

      // Cmd+D - Duplicate selected tool
      if (isMod && e.key === "d" && selectedNodeId) {
        e.preventDefault();
        duplicateTool(selectedNodeId);
      }

      // Cmd+Z - Undo
      if (isMod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Cmd+Shift+Z - Redo
      if (isMod && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNodeId, copyTool, pasteTool, duplicateTool, undo, redo]);

  // Add tool helper
  const handleAddTool = useCallback(
    (templateIndex: number) => {
      const template = toolTemplates[templateIndex];
      const newTool: MCPTool = {
        id: `tool-${Date.now()}`,
        name: template.name,
        description: template.description,
        icon: template.icon,
        parameters: [...template.defaultParameters],
      };
      addTool(newTool);
    },
    [addTool],
  );

  const handleAddCustomTool = useCallback(() => {
    const newTool: MCPTool = {
      id: `tool-${Date.now()}`,
      name: "custom_tool",
      description: "A custom tool",
      icon: "Terminal",
      parameters: [],
    };
    addTool(newTool);
    selectNode(newTool.id);
  }, [addTool, selectNode]);

  const handleExport = useCallback(
    async (format: ExportFormat = "typescript") => {
      const bundle = createExportBundle(serverConfig, format);

      let blob: Blob;
      if (format === "typescript") {
        blob = new Blob([bundle.files[0].content], { type: "text/typescript" });
      } else {
        blob = await createZipBlob(bundle.files);
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = bundle.filename;
      a.click();
      URL.revokeObjectURL(url);

      // Celebration confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#8b5cf6", "#10b981"],
      });
    },
    [serverConfig],
  );

  // Build commands for palette
  const commands = useMemo(() => {
    const cmds: Array<{
      id: string;
      label: string;
      category: "add" | "action" | "navigate";
      icon: typeof Download;
      keywords?: string[];
      action: () => void;
    }> = [];

    // Add tool commands
    toolTemplates.forEach((template, index) => {
      cmds.push({
        id: `add-${template.name}`,
        label: `Add ${template.name}`,
        category: "add",
        icon: commandIcons[template.icon] || commandIcons.Terminal,
        keywords: [template.description, "create", "new"],
        action: () => handleAddTool(index),
      });
    });

    // Custom tool
    cmds.push({
      id: "add-custom",
      label: "Add Custom Tool",
      category: "add",
      icon: commandIcons.Plus,
      keywords: ["create", "new", "blank", "scratch"],
      action: handleAddCustomTool,
    });

    // Action commands
    cmds.push({
      id: "export",
      label: "Export Server",
      category: "action",
      icon: commandIcons.Download,
      keywords: ["download", "save", "generate"],
      action: () => handleExport("typescript"),
    });

    if (selectedNodeId) {
      cmds.push({
        id: "copy",
        label: "Copy Tool",
        category: "action",
        icon: commandIcons.Copy,
        keywords: ["clipboard"],
        action: () => copyTool(selectedNodeId),
      });

      cmds.push({
        id: "duplicate",
        label: "Duplicate Tool",
        category: "action",
        icon: commandIcons.Copy,
        keywords: ["clone", "copy"],
        action: () => duplicateTool(selectedNodeId),
      });
    }

    cmds.push({
      id: "paste",
      label: "Paste Tool",
      category: "action",
      icon: commandIcons.Clipboard,
      keywords: ["clipboard"],
      action: pasteTool,
    });

    if (canUndo()) {
      cmds.push({
        id: "undo",
        label: "Undo",
        category: "action",
        icon: commandIcons.Undo2,
        keywords: ["back", "revert"],
        action: undo,
      });
    }

    if (canRedo()) {
      cmds.push({
        id: "redo",
        label: "Redo",
        category: "action",
        icon: commandIcons.Redo2,
        keywords: ["forward"],
        action: redo,
      });
    }

    // Navigate to existing tools
    tools.forEach((tool) => {
      cmds.push({
        id: `nav-${tool.id}`,
        label: tool.name,
        category: "navigate",
        icon: commandIcons[tool.icon] || commandIcons.Terminal,
        keywords: [tool.description],
        action: () => selectNode(tool.id),
      });
    });

    return cmds;
  }, [
    tools,
    selectedNodeId,
    handleAddTool,
    handleAddCustomTool,
    handleExport,
    selectNode,
    copyTool,
    duplicateTool,
    pasteTool,
    undo,
    redo,
    canUndo,
    canRedo,
  ]);

  return (
    <div className="h-screen w-screen flex bg-[var(--bg-base)] text-foreground overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Canvas Panel with Floating HUD */}
        <div className="flex-1 relative">
          {/* Floating Header HUD */}
          <header className="absolute top-4 left-4 right-4 z-50 h-14 surface-overlay flex items-center justify-between px-4 rounded-xl shadow-lg border border-[var(--border-strong)]">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                <Zap
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                  strokeWidth={2}
                />
              </div>
              <div className="hidden sm:block ml-1">
                <h1 className="text-sm font-semibold text-[var(--text-primary)]">
                  MCP Studio
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Command palette button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCommandPalette(true)}
                className="hidden sm:flex items-center gap-2"
              >
                <Command className="w-4 h-4" />
                <kbd className="px-1.5 py-0.5 text-[10px] bg-[var(--bg-elevated)] rounded border border-[var(--border-default)]">
                  K
                </kbd>
              </Button>
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
                onClick={() => setShowServerSettings(true)}
                className="hidden sm:flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden md:inline">Settings</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    "https://github.com/modelcontextprotocol/specification",
                    "_blank",
                  )
                }
                className="hidden md:flex"
              >
                <Github className="w-4 h-4 mr-2" />
                MCP Docs
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white border-0 transition-colors"
                    disabled={serverConfig.tools.length === 0}
                  >
                    <Download className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Export</span>
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport("typescript")}>
                    <FileCode className="w-4 h-4 mr-2" />
                    TypeScript (.ts)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("docker")}>
                    <Container className="w-4 h-4 mr-2" />
                    Docker Bundle (.zip)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("railway")}>
                    <Train className="w-4 h-4 mr-2" />
                    Railway Bundle (.zip)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport("v0")}>
                    <Rocket className="w-4 h-4 mr-2" />
                    <div className="flex flex-col">
                      <span>v0 Bundle (.zip)</span>
                      <span className="text-xs text-muted-foreground">Deploy to Vercel v0 API</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <ErrorBoundary label="Canvas">
            <CanvasPanel />
          </ErrorBoundary>
        </div>

        {/* Preview Panel - Desktop */}
        <div className="hidden lg:block w-[500px] border-l border-[var(--border-default)] bg-[var(--bg-surface)] relative z-10">
          <ErrorBoundary label="Preview">
            <PreviewPanel />
          </ErrorBoundary>
        </div>

        {/* Preview Panel - Mobile Slide-up */}
        {showMobilePreview && (
          <div className="lg:hidden fixed inset-0 top-14 z-40 bg-[var(--bg-base)] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
              <h2 className="font-semibold text-[var(--text-primary)]">
                Preview
              </h2>
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

      {/* Config Panels (slides in when node selected) */}
      <ErrorBoundary label="Configuration">
        {selectedNodeType === "tool" && <ToolConfigPanel key={selectedNodeId} />}
        {selectedNodeType === "resource" && <ResourceConfigPanel key={selectedNodeId} />}
        {selectedNodeType === "prompt" && <PromptConfigPanel key={selectedNodeId} />}
      </ErrorBoundary>

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        commands={commands}
      />

      {/* Server Settings Panel */}
      <ServerConfigPanel
        isOpen={showServerSettings}
        onClose={() => setShowServerSettings(false)}
      />
    </div>
  );
}
