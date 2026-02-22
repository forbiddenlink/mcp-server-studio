'use client';

import { memo } from 'react';
import {
  BaseEdge,
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
} from '@xyflow/react';

function DataFlowEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* Glow layer for selected state */}
      {selected && (
        <BaseEdge
          id={`${id}-glow`}
          path={edgePath}
          style={{
            stroke: 'var(--accent)',
            strokeWidth: 8,
            strokeOpacity: 0.2,
            filter: 'blur(4px)',
          }}
        />
      )}

      {/* Main edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: selected ? 'var(--accent)' : 'var(--border-strong)',
          strokeWidth: 2,
          transition: 'stroke 0.15s ease',
        }}
      />

      {/* Animated flow particle */}
      <circle r="3" fill="var(--accent)">
        <animateMotion
          dur="2s"
          repeatCount="indefinite"
          path={edgePath}
        />
      </circle>

      {/* Data flow label */}
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-none"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          <div
            className={`
              px-2 py-0.5 rounded-full text-[10px] font-medium
              transition-all duration-150
              ${selected
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-elevated)] text-[var(--text-tertiary)] border border-[var(--border-default)]'
              }
            `}
          >
            data
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const DataFlowEdge = memo(DataFlowEdgeComponent);
DataFlowEdge.displayName = 'DataFlowEdge';
