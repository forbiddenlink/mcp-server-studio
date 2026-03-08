import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResourceNode } from '../canvas/ResourceNode';
import type { MCPResource } from '@/lib/types';

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

function makeResource(overrides: Partial<MCPResource> = {}): MCPResource {
  return {
    id: 'resource-1',
    name: 'user_profile',
    description: 'User profile data',
    uri: 'user://{userId}/profile',
    mimeType: 'application/json',
    ...overrides,
  };
}

function renderResourceNode(resource: MCPResource, overrides: { selected?: boolean } = {}) {
  const defaultProps = {
    id: resource.id,
    data: { resource },
    selected: false,
    type: 'resourceNode' as const,
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
  return render(<ResourceNode {...(defaultProps as any)} />);
}

// ---- Tests ----

describe('ResourceNode', () => {
  beforeEach(() => {
    selectNode.mockClear();
  });

  it('renders resource name and URI', () => {
    renderResourceNode(makeResource());
    expect(screen.getByText('user_profile')).toBeTruthy();
    expect(screen.getByText('user://{userId}/profile')).toBeTruthy();
  });

  it('shows mimeType badge', () => {
    renderResourceNode(makeResource());
    expect(screen.getByText('application/json')).toBeTruthy();
  });

  it('shows text mimeType badge', () => {
    renderResourceNode(makeResource({ mimeType: 'text/plain' }));
    expect(screen.getByText('text/plain')).toBeTruthy();
  });

  it('calls selectNode on click', () => {
    renderResourceNode(makeResource());
    fireEvent.click(screen.getByRole('button'));
    expect(selectNode).toHaveBeenCalledWith('resource-1');
  });

  it('calls selectNode on Enter key', () => {
    renderResourceNode(makeResource());
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(selectNode).toHaveBeenCalledWith('resource-1');
  });

  it('calls selectNode on Space key', () => {
    renderResourceNode(makeResource());
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
    expect(selectNode).toHaveBeenCalledWith('resource-1');
  });

  it('has an accessible aria-label', () => {
    renderResourceNode(makeResource());
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Resource: user_profile');
  });

  it('renders with different resource names', () => {
    renderResourceNode(makeResource({ name: 'config_settings', uri: 'config://app/settings' }));
    expect(screen.getByText('config_settings')).toBeTruthy();
    expect(screen.getByText('config://app/settings')).toBeTruthy();
  });

  it('renders with image mimeType', () => {
    renderResourceNode(makeResource({ mimeType: 'image/png' }));
    expect(screen.getByText('image/png')).toBeTruthy();
  });

  it('handles empty description gracefully', () => {
    renderResourceNode(makeResource({ description: '' }));
    expect(screen.getByText('user_profile')).toBeTruthy();
  });
});
