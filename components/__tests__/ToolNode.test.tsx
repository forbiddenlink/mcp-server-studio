import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolNode } from '../canvas/ToolNode';
import type { MCPTool } from '@/lib/types';

// ---- Mocks ----

const selectNode = vi.fn();

vi.mock('@/lib/store/useStore', () => ({
  useStore: () => ({
    selectNode,
    selectedNodeId: null,
  }),
}));

// React Flow: stub Handle so it renders nothing
vi.mock('@xyflow/react', () => ({
  Handle: () => null,
  Position: { Top: 'top', Bottom: 'bottom' },
}));

// ---- Helpers ----

function makeTool(overrides: Partial<MCPTool> = {}): MCPTool {
  return {
    id: 'tool-1',
    name: 'search_web',
    description: 'Search the web for results',
    icon: 'Search',
    parameters: [
      { name: 'query', type: 'string', description: 'search query', required: true },
    ],
    ...overrides,
  };
}

function renderToolNode(tool: MCPTool, overrides: { selected?: boolean } = {}) {
  const defaultProps = {
    id: tool.id,
    data: { tool },
    selected: false,
    type: 'toolNode' as const,
    isConnectable: true,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    zIndex: 0,
    dragging: false,
    dragHandle: undefined,
    parentId: undefined,
    sourcePosition: undefined,
    targetPosition: undefined,
    ...overrides,
  };
  // ToolNode is a memo'd component — use the underlying component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return render(<ToolNode {...(defaultProps as any)} />);
}

// ---- Tests ----

describe('ToolNode', () => {
  beforeEach(() => {
    selectNode.mockClear();
  });

  it('renders tool name and description', () => {
    renderToolNode(makeTool());
    expect(screen.getByText('search_web')).toBeTruthy();
    expect(screen.getByText('Search the web for results')).toBeTruthy();
  });

  it('shows parameter count (singular)', () => {
    renderToolNode(makeTool());
    expect(screen.getByText('1 param')).toBeTruthy();
  });

  it('shows parameter count (plural)', () => {
    renderToolNode(
      makeTool({
        parameters: [
          { name: 'a', type: 'string', description: 'a', required: true },
          { name: 'b', type: 'number', description: 'b', required: false },
        ],
      })
    );
    expect(screen.getByText('2 params')).toBeTruthy();
  });

  it('shows Sampling badge when sampling is enabled', () => {
    renderToolNode(
      makeTool({ sampling: { enabled: true, maxTokens: 100 } })
    );
    expect(screen.getByText('Sampling')).toBeTruthy();
  });

  it('shows Elicitation badge when elicitation is enabled', () => {
    renderToolNode(
      makeTool({ elicitation: { enabled: true, mode: 'form', message: 'hi' } })
    );
    expect(screen.getByText('Elicitation')).toBeTruthy();
  });

  it('shows Tasks badge when tasks is enabled', () => {
    renderToolNode(makeTool({ tasks: { enabled: true } }));
    expect(screen.getByText('Tasks')).toBeTruthy();
  });

  it('shows Incomplete warning when a parameter is missing name', () => {
    renderToolNode(
      makeTool({
        parameters: [{ name: '', type: 'string', description: 'desc', required: false }],
      })
    );
    expect(screen.getByText('Incomplete')).toBeTruthy();
  });

  it('calls selectNode on click', () => {
    renderToolNode(makeTool());
    fireEvent.click(screen.getByRole('button'));
    expect(selectNode).toHaveBeenCalledWith('tool-1');
  });

  it('calls selectNode on Enter key', () => {
    renderToolNode(makeTool());
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(selectNode).toHaveBeenCalledWith('tool-1');
  });

  it('has an accessible aria-label', () => {
    renderToolNode(makeTool());
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Tool: search_web');
  });
});
