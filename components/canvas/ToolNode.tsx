'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MCPTool } from '@/lib/types';
import { useStore } from '@/lib/store/useStore';
import { cn } from '@/lib/utils';
import {
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
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';

// Icon mapping for tool icons
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

  // Get the icon component, fallback to Terminal if not found
  const IconComponent = iconMap[tool.icon] || Terminal;
  const hasIncompleteParams = tool.parameters.some(p => !p.name || !p.description);

  return (
    <div
      onClick={handleClick}
      className={cn(
        'surface-base p-4 min-w-[220px] cursor-pointer transition-all duration-200',
        'hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)]',
        isSelected && 'ring-2 ring-[var(--accent)] border-[var(--border-accent)]',
        isSelected && 'shadow-[var(--shadow-glow)]'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-[var(--accent)] !border-2 !border-[var(--bg-base)]"
      />

      <div className="flex items-start gap-3">
        {/* Icon Container */}
        <div className="icon-container flex-shrink-0">
          <IconComponent className="w-5 h-5" strokeWidth={1.5} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-[var(--text-primary)] truncate">
            {tool.name}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
            {tool.description}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[var(--border-default)]">
            <span className="text-xs text-[var(--text-tertiary)]">
              {tool.parameters.length} {tool.parameters.length === 1 ? 'param' : 'params'}
            </span>
            {hasIncompleteParams && (
              <div className="flex items-center gap-1 text-xs text-[var(--warning)]">
                <AlertTriangle className="w-3 h-3" />
                <span>Incomplete</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-[var(--accent)] !border-2 !border-[var(--bg-base)]"
      />
    </div>
  );
}

export const ToolNode = memo(ToolNodeComponent);
ToolNode.displayName = 'ToolNode';
