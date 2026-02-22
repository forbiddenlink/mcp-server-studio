'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MCPResource } from '@/lib/types';
import { useStore } from '@/lib/store/useStore';
import { cn } from '@/lib/utils';
import { Database, FileText } from 'lucide-react';

export interface ResourceNodeData {
  resource: MCPResource;
}

function ResourceNodeComponent({ id, data, selected }: NodeProps) {
  const { selectNode, selectedNodeId } = useStore();
  const resource = (data as unknown as ResourceNodeData).resource;
  const isSelected = selectedNodeId === id || selected;

  const handleClick = () => {
    selectNode(id);
  };

  // Choose icon based on mimeType
  const IconComponent = resource.mimeType.includes('text') ? FileText : Database;

  return (
    <div
      onClick={handleClick}
      className={cn(
        'surface-base p-4 min-w-[220px] cursor-pointer transition-all duration-200',
        'hover:border-emerald-500/50 hover:bg-[var(--bg-elevated)]',
        isSelected && 'ring-2 ring-emerald-500 border-emerald-500/50',
        isSelected && 'shadow-[0_0_20px_rgba(16,185,129,0.15)]'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-emerald-500 !border-2 !border-[var(--bg-base)]"
      />

      <div className="flex items-start gap-3">
        {/* Icon Container */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <IconComponent className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-[var(--text-primary)] truncate">
            {resource.name}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-1 leading-relaxed font-mono">
            {resource.uri}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[var(--border-default)]">
            <span className="text-xs text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
              {resource.mimeType}
            </span>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-emerald-500 !border-2 !border-[var(--bg-base)]"
      />
    </div>
  );
}

export const ResourceNode = memo(ResourceNodeComponent);
ResourceNode.displayName = 'ResourceNode';
