import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PromptNode } from '../canvas/PromptNode';
import type { MCPPrompt } from '@/lib/types';

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

function makePrompt(overrides: Partial<MCPPrompt> = {}): MCPPrompt {
  return {
    id: 'prompt-1',
    name: 'code_review',
    description: 'Review code for best practices',
    template: 'Review the following code: {{code}}',
    arguments: [
      { name: 'code', type: 'string', description: 'The code to review', required: true },
    ],
    ...overrides,
  };
}

function renderPromptNode(prompt: MCPPrompt, overrides: { selected?: boolean } = {}) {
  const defaultProps = {
    id: prompt.id,
    data: { prompt },
    selected: false,
    type: 'promptNode' as const,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return render(<PromptNode {...(defaultProps as any)} />);
}

// ---- Tests ----

describe('PromptNode', () => {
  beforeEach(() => {
    selectNode.mockClear();
  });

  it('renders prompt name and description', () => {
    renderPromptNode(makePrompt());
    expect(screen.getByText('code_review')).toBeTruthy();
    expect(screen.getByText('Review code for best practices')).toBeTruthy();
  });

  it('shows argument count (singular)', () => {
    renderPromptNode(makePrompt());
    expect(screen.getByText('1 arg')).toBeTruthy();
  });

  it('shows argument count (plural)', () => {
    renderPromptNode(
      makePrompt({
        arguments: [
          { name: 'code', type: 'string', description: 'The code', required: true },
          { name: 'language', type: 'string', description: 'Programming language', required: false },
        ],
      })
    );
    expect(screen.getByText('2 args')).toBeTruthy();
  });

  it('shows zero arguments correctly', () => {
    renderPromptNode(makePrompt({ arguments: [] }));
    expect(screen.getByText('0 args')).toBeTruthy();
  });

  it('calls selectNode on click', () => {
    renderPromptNode(makePrompt());
    fireEvent.click(screen.getByRole('button'));
    expect(selectNode).toHaveBeenCalledWith('prompt-1');
  });

  it('calls selectNode on Enter key', () => {
    renderPromptNode(makePrompt());
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(selectNode).toHaveBeenCalledWith('prompt-1');
  });

  it('calls selectNode on Space key', () => {
    renderPromptNode(makePrompt());
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
    expect(selectNode).toHaveBeenCalledWith('prompt-1');
  });

  it('has an accessible aria-label', () => {
    renderPromptNode(makePrompt());
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Prompt: code_review');
  });

  it('renders with different prompt names', () => {
    renderPromptNode(makePrompt({ name: 'summarize_text', description: 'Summarize the given text' }));
    expect(screen.getByText('summarize_text')).toBeTruthy();
    expect(screen.getByText('Summarize the given text')).toBeTruthy();
  });

  it('handles long descriptions gracefully', () => {
    const longDesc = 'This is a very long description that should be truncated in the UI when it exceeds the available space';
    renderPromptNode(makePrompt({ description: longDesc }));
    expect(screen.getByText(longDesc)).toBeTruthy();
  });

  it('renders with multiple arguments', () => {
    renderPromptNode(
      makePrompt({
        arguments: [
          { name: 'a', type: 'string', description: 'a', required: true },
          { name: 'b', type: 'number', description: 'b', required: false },
          { name: 'c', type: 'boolean', description: 'c', required: false },
        ],
      })
    );
    expect(screen.getByText('3 args')).toBeTruthy();
  });
});
