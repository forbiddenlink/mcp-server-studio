'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MCPTool } from '@/lib/types';
import { useStore } from '@/lib/store/useStore';
import { cn } from '@/lib/utils';

export interface ToolNodeData {
  tool: MCPTool;
}

function ToolNodeComponent({ id, data, selected }: NodeProps) {
  const { selectNode, selectedNodeId } = useStore();
  const tool = (data as unknown as ToolNodeData).tool;
  const isSelected = selectedNodeId === id || selected;

  const handleClick = () => {
    selectNode(id);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'glass-panel rounded-lg p-4 min-w-[200px] cursor-pointer transition-all duration-200',
        isSelected && 'ring-2 ring-primary glow-primary'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-primary"
      />

      <div className="flex items-start gap-3">
        <div className="text-3xl">{tool.icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{tool.name}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {tool.description}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="text-xs text-muted-foreground">
              {tool.parameters.length} {tool.parameters.length === 1 ? 'parameter' : 'parameters'}
            </div>
            {tool.parameters.some(p => !p.name || !p.description) && (
              <div className="text-xs text-warning">⚠️ Incomplete</div>
            )}
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-primary"
      />
    </div>
  );
}

export const ToolNode = memo(ToolNodeComponent);
ToolNode.displayName = 'ToolNode';
