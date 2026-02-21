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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ToolNode } from './ToolNode';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useStore } from '@/lib/store/useStore';
import { toolTemplates } from '@/lib/templates/toolTemplates';
import { MCPTool } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function CanvasPanel() {
  const { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange, addTool } = useStore();

  const nodeTypes = useMemo(
    () => ({
      toolNode: ToolNode as any,
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

  const onConnect = useCallback(
    (params: Connection) => setEdges(addEdge(params, edges)),
    [edges, setEdges]
  );

  return (
    <div className="w-full h-full relative grid-bg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
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
            <Button className="glow-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Tool
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 glass-panel">
            {toolTemplates.map((template, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => handleAddTool(index)}
                className="cursor-pointer hover:bg-accent/10"
              >
                <span className="mr-2 text-lg">{template.icon}</span>
                <div>
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-muted-foreground">{template.description}</div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Empty State */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-4">
            <div className="text-6xl">⚡</div>
            <h3 className="text-2xl font-bold">Start Building Your MCP Server</h3>
            <p className="text-muted-foreground">
              Click "Add Tool" to add your first tool
            </p>
            <div className="animate-bounce mt-4">
              <div className="text-3xl">↖️</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
