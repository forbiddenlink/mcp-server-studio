'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MCPPrompt } from '@/lib/types';
import { useStore } from '@/lib/store/useStore';
import { cn } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';

export interface PromptNodeData {
  prompt: MCPPrompt;
}

function PromptNodeComponent({ id, data, selected }: NodeProps) {
  const { selectNode, selectedNodeId } = useStore();
  const prompt = (data as unknown as PromptNodeData).prompt;
  const isSelected = selectedNodeId === id || selected;

  const handleClick = () => {
    selectNode(id);
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
      role="button"
      tabIndex={0}
      aria-label={`Prompt: ${prompt.name}`}
      className={cn(
        'surface-base p-4 min-w-[220px] cursor-pointer transition-colors duration-100',
        'hover:border-violet-500/50 hover:bg-[var(--bg-hover)]',
        isSelected && 'ring-2 ring-offset-2 ring-offset-[var(--bg-base)] ring-violet-500 border-violet-500/50'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-violet-500 !border-2 !border-[var(--bg-base)]"
      />

      <div className="flex items-start gap-3">
        {/* Icon Container */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-violet-500" strokeWidth={1.5} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-[var(--text-primary)] truncate">
            {prompt.name}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
            {prompt.description}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[var(--border-default)]">
            <span className="text-xs text-violet-500 bg-violet-500/10 px-2 py-0.5 rounded">
              {prompt.arguments.length} {prompt.arguments.length === 1 ? 'arg' : 'args'}
            </span>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-violet-500 !border-2 !border-[var(--bg-base)]"
      />
    </div>
  );
}

export const PromptNode = memo(PromptNodeComponent);
PromptNode.displayName = 'PromptNode';
