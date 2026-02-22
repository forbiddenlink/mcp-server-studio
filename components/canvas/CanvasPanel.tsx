'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  MarkerType,
  ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ToolNode } from './ToolNode';
import { ResourceNode } from './ResourceNode';
import { PromptNode } from './PromptNode';
import { DataFlowEdge } from './DataFlowEdge';
import { Button } from '@/components/ui/button';
import { AIGenerator } from '@/components/ui/ai-generator';
import { ImportDialog } from '@/components/ui/import-dialog';
import {
  Plus,
  Zap,
  Search,
  FileText,
  Globe,
  Database,
  Mail,
  FilePlus,
  Terminal,
  Cloud,
  GitBranch,
  Image,
  Calculator,
  Calendar,
  MessageSquare,
  Code,
  Languages,
  Camera,
  Sparkles,
  FileUp,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react';
import { useStore } from '@/lib/store/useStore';
import { toolTemplates } from '@/lib/templates/toolTemplates';
import { MCPTool, MCPResource, MCPPrompt, ToolTemplate } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { TemplateGallery } from '@/components/ui/template-gallery';

// Icon mapping for dropdown menu
const iconMap: Record<string, LucideIcon> = {
  Search,
  FileText,
  Globe,
  Database,
  Mail,
  FilePlus,
  Terminal,
  Cloud,
  GitBranch,
  Image,
  Calculator,
  Calendar,
  MessageSquare,
  Code,
  Languages,
  Camera,
};

export function CanvasPanel() {
  const { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange, addTool, addResource, addPrompt, selectNode } = useStore();
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false);

  const handleAIGenerate = (tool: MCPTool) => {
    addTool(tool);
    selectNode(tool.id);
  };

  const handleImport = (tools: MCPTool[]) => {
    tools.forEach(tool => {
      addTool(tool);
    });
    // Select the first imported tool
    if (tools.length > 0) {
      selectNode(tools[0].id);
    }
  };

  const handleSelectTemplate = (template: ToolTemplate) => {
    const newTool: MCPTool = {
      id: `tool-${Date.now()}`,
      name: template.name,
      description: template.description,
      icon: template.icon,
      parameters: [...template.defaultParameters],
    };
    addTool(newTool);
    selectNode(newTool.id);
  };

  const nodeTypes = useMemo(
    () => ({
      toolNode: ToolNode as any,
      resourceNode: ResourceNode as any,
      promptNode: PromptNode as any,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      dataFlow: DataFlowEdge as any,
    }),
    []
  );

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'dataFlow',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color: 'var(--border-strong)',
      },
    }),
    []
  );

  const handleAddTool = (templateIndex: number) => {
    const template = toolTemplates[templateIndex];
    const newTool: MCPTool = {
      id: `tool-${Date.now()}`,
      name: template.name,
      description: template.description,
      icon: template.icon,
      parameters: [...template.defaultParameters],
    };
    addTool(newTool);
  };

  const handleAddCustomTool = () => {
    const newTool: MCPTool = {
      id: `tool-${Date.now()}`,
      name: 'custom_tool',
      description: 'A custom tool',
      icon: 'Terminal',
      parameters: [],
    };
    addTool(newTool);
    selectNode(newTool.id);
  };

  const handleAddResource = () => {
    const newResource: MCPResource = {
      id: `resource-${Date.now()}`,
      name: 'new_resource',
      uri: 'file:///path/to/resource',
      mimeType: 'text/plain',
      description: 'A new resource',
    };
    addResource(newResource);
    selectNode(newResource.id);
  };

  const handleAddPrompt = () => {
    const newPrompt: MCPPrompt = {
      id: `prompt-${Date.now()}`,
      name: 'new_prompt',
      description: 'A new prompt template',
      arguments: [],
    };
    addPrompt(newPrompt);
    selectNode(newPrompt.id);
  };

  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      // Prevent self-connections
      if (connection.source === connection.target) return false;

      // Prevent duplicate connections
      const isDuplicate = edges.some(
        (edge) =>
          edge.source === connection.source && edge.target === connection.target
      );
      if (isDuplicate) return false;

      return true;
    },
    [edges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (!isValidConnection(params)) return;
      setEdges(addEdge(params, edges));
    },
    [edges, setEdges, isValidConnection]
  );

  return (
    <div className="w-full h-full relative grid-bg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineType={ConnectionLineType.Bezier}
        connectionLineStyle={{
          stroke: 'var(--accent)',
          strokeWidth: 2,
          strokeDasharray: '5,5',
        }}
        fitView
        className="bg-transparent"
      >
        <Background color="rgba(99, 102, 241, 0.05)" gap={20} />
        <Controls className="glass-panel" />
        <MiniMap className="glass-panel" />
      </ReactFlow>

      {/* Add Tool Button */}
      <div className="absolute top-6 left-6 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="hover:shadow-[var(--shadow-glow)] transition-shadow">
              <Plus className="w-4 h-4 mr-2" />
              Add Tool
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 surface-overlay p-1 max-h-[70vh] overflow-y-auto">
            {/* Browse Templates - Opens Gallery */}
            <DropdownMenuItem
              onClick={() => setIsTemplateGalleryOpen(true)}
              className="cursor-pointer p-3 rounded-lg hover:bg-[var(--accent)] hover:text-white focus:bg-[var(--accent)] focus:text-white group"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--accent-muted)] group-hover:bg-white/20 flex items-center justify-center mr-3 transition-colors">
                <LayoutGrid className="w-4 h-4 text-[var(--accent)] group-hover:text-white" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm">Browse Templates</div>
                <div className="text-xs opacity-70">29 templates in 7 categories</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[var(--border-default)]" />
            {/* Quick Add - Show first 5 common templates */}
            <div className="px-2 py-1.5 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
              Quick Add
            </div>
            {toolTemplates.slice(0, 5).map((template, index) => {
              const IconComponent = iconMap[template.icon] || Terminal;
              return (
                <DropdownMenuItem
                  key={index}
                  onClick={() => handleAddTool(index)}
                  className="cursor-pointer p-3 rounded-lg hover:bg-[var(--bg-hover)] focus:bg-[var(--bg-hover)]"
                >
                  <div className="icon-container-sm icon-container mr-3 flex-shrink-0">
                    <IconComponent className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-[var(--text-primary)]">{template.name}</div>
                    <div className="text-xs text-[var(--text-tertiary)] truncate">{template.description}</div>
                  </div>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator className="bg-[var(--border-default)]" />
            <DropdownMenuItem
              onClick={() => setIsAIGeneratorOpen(true)}
              className="cursor-pointer p-3 rounded-lg hover:bg-[var(--bg-hover)] focus:bg-[var(--bg-hover)]"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mr-3">
                <Sparkles className="w-4 h-4 text-violet-500" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm text-[var(--text-primary)]">Generate with AI</div>
                <div className="text-xs text-[var(--text-tertiary)] truncate">Describe in natural language</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleAddCustomTool}
              className="cursor-pointer p-3 rounded-lg hover:bg-[var(--bg-hover)] focus:bg-[var(--bg-hover)]"
            >
              <div className="icon-container-sm icon-container mr-3 flex-shrink-0">
                <Plus className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm text-[var(--text-primary)]">Custom Tool</div>
                <div className="text-xs text-[var(--text-tertiary)] truncate">Create from scratch</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[var(--border-default)]" />
            <DropdownMenuItem
              onClick={handleAddResource}
              className="cursor-pointer p-3 rounded-lg hover:bg-[var(--bg-hover)] focus:bg-[var(--bg-hover)]"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mr-3">
                <Database className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm text-[var(--text-primary)]">Add Resource</div>
                <div className="text-xs text-[var(--text-tertiary)] truncate">Expose data to clients</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleAddPrompt}
              className="cursor-pointer p-3 rounded-lg hover:bg-[var(--bg-hover)] focus:bg-[var(--bg-hover)]"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center mr-3">
                <MessageSquare className="w-4 h-4 text-violet-500" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm text-[var(--text-primary)]">Add Prompt</div>
                <div className="text-xs text-[var(--text-tertiary)] truncate">Reusable prompt template</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[var(--border-default)]" />
            <DropdownMenuItem
              onClick={() => setIsImportDialogOpen(true)}
              className="cursor-pointer p-3 rounded-lg hover:bg-[var(--bg-hover)] focus:bg-[var(--bg-hover)]"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center mr-3">
                <FileUp className="w-4 h-4 text-cyan-500" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm text-[var(--text-primary)]">Import from OpenAPI</div>
                <div className="text-xs text-[var(--text-tertiary)] truncate">Import tools from API spec</div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Import Dialog */}
      <ImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImport}
      />

      {/* AI Generator Dialog */}
      <AIGenerator
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        onGenerate={handleAIGenerate}
      />

      {/* Template Gallery Modal */}
      <TemplateGallery
        isOpen={isTemplateGalleryOpen}
        onClose={() => setIsTemplateGalleryOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Empty State - Clean & Professional */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center max-w-md px-8">
            <div className="w-16 h-16 rounded-2xl bg-[var(--accent-muted)] flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-[var(--accent)]" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              Start Building
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Add your first tool to begin creating your MCP server
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
