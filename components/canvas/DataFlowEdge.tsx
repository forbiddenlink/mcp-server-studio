'use client'

import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getBezierPath } from '@xyflow/react'
import { memo, useEffect, useState } from 'react'

// Track the OS reduced-motion preference. SVG SMIL (<animateMotion>) ignores
// CSS `prefers-reduced-motion`, so the packet must be gated in JS; the dashed
// "current" is CSS-driven and gated in globals.css.
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}

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
  const reducedMotion = usePrefersReducedMotion()
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

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

      {/* Main edge (the physical wire) */}
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

      {/* Flowing "current" — a dashed overlay that streams toward the target,
          giving every wire a clear direction. Animation gated in globals.css. */}
      <path
        d={edgePath}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="5 11"
        className="edge-flow"
        style={{ opacity: selected ? 0.95 : 0.4 }}
      />

      {/* Animated data packet (SMIL — JS-gated for reduced motion) */}
      {!reducedMotion && (
        <circle r="3" fill="var(--accent)">
          <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}

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
              ${
                selected
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
  )
}

export const DataFlowEdge = memo(DataFlowEdgeComponent)
DataFlowEdge.displayName = 'DataFlowEdge'
