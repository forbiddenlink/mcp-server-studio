'use client';

import { useCallback, useMemo } from 'react';
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
import { DataFlowEdge } from './DataFlowEdge';
import { Button } from '@/components/ui/button';
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
  type LucideIcon,
} from 'lucide-react';
import { useStore } from '@/lib/store/useStore';
import { toolTemplates } from '@/lib/templates/toolTemplates';
import { MCPTool } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

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
  const { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange, addTool, selectNode } = useStore();

  const nodeTypes = useMemo(
    () => ({
      toolNode: ToolNode as any,
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
          <DropdownMenuContent align="start" className="w-64 surface-overlay p-1">
            {toolTemplates.map((template, index) => {
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
