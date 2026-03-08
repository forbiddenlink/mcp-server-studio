import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CanvasPanel } from '../canvas/CanvasPanel';

// ---- Mocks ----

const mockAddTool = vi.fn();
const mockAddResource = vi.fn();
const mockAddPrompt = vi.fn();
const mockSelectNode = vi.fn();
const mockSetEdges = vi.fn();
const mockOnNodesChange = vi.fn();
const mockOnEdgesChange = vi.fn();

let mockNodes: { id: string; type: string; data: Record<string, unknown> }[] = [];
let mockEdges: { id: string; source: string; target: string }[] = [];

vi.mock('@/lib/store/useStore', () => ({
  useStore: () => ({
    nodes: mockNodes,
    edges: mockEdges,
    setEdges: mockSetEdges,
    onNodesChange: mockOnNodesChange,
    onEdgesChange: mockOnEdgesChange,
    addTool: mockAddTool,
    addResource: mockAddResource,
    addPrompt: mockAddPrompt,
    selectNode: mockSelectNode,
  }),
}));

// Mock ReactFlow and related components
vi.mock('@xyflow/react', () => ({
  ReactFlow: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="react-flow">{children}</div>
  ),
  Background: () => <div data-testid="background" />,
  Controls: () => <div data-testid="controls" />,
  MiniMap: () => <div data-testid="minimap" />,
  addEdge: vi.fn((params, edges) => [...edges, params]),
  Handle: () => null,
  Position: { Top: 'top', Bottom: 'bottom' },
  MarkerType: { ArrowClosed: 'arrowClosed' },
  ConnectionLineType: { Bezier: 'bezier' },
}));

// Mock child components that are complex
vi.mock('@/components/ui/ai-generator', () => ({
  AIGenerator: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="ai-generator">AI Generator</div> : null,
}));

vi.mock('@/components/ui/import-dialog', () => ({
  ImportDialog: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="import-dialog">Import Dialog</div> : null,
}));

vi.mock('@/components/ui/template-gallery', () => ({
  TemplateGallery: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="template-gallery">Template Gallery</div> : null,
}));

// ---- Tests ----

describe('CanvasPanel', () => {
  beforeEach(() => {
    mockAddTool.mockClear();
    mockAddResource.mockClear();
    mockAddPrompt.mockClear();
    mockSelectNode.mockClear();
    mockSetEdges.mockClear();
    mockNodes = [];
    mockEdges = [];
  });

  describe('Rendering', () => {
    it('renders ReactFlow canvas', () => {
      render(<CanvasPanel />);
      expect(screen.getByTestId('react-flow')).toBeTruthy();
    });

    it('renders Background component', () => {
      render(<CanvasPanel />);
      expect(screen.getByTestId('background')).toBeTruthy();
    });

    it('renders Controls component', () => {
      render(<CanvasPanel />);
      expect(screen.getByTestId('controls')).toBeTruthy();
    });

    it('renders MiniMap component', () => {
      render(<CanvasPanel />);
      expect(screen.getByTestId('minimap')).toBeTruthy();
    });

    it('renders Add Tool button', () => {
      render(<CanvasPanel />);
      expect(screen.getByText('Add Tool')).toBeTruthy();
    });

    it('Add Tool button has correct attributes', () => {
      render(<CanvasPanel />);
      const button = screen.getByText('Add Tool').closest('button');
      expect(button).toBeTruthy();
      expect(button?.getAttribute('aria-haspopup')).toBe('menu');
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no nodes exist', () => {
      mockNodes = [];
      render(<CanvasPanel />);
      expect(screen.getByText('Start Building')).toBeTruthy();
      expect(screen.getByText('Add your first tool to begin creating your MCP server')).toBeTruthy();
    });

    it('hides empty state when nodes exist', () => {
      mockNodes = [
        {
          id: 'tool-1',
          type: 'toolNode',
          data: { tool: { id: 'tool-1', name: 'test', description: 'test', parameters: [] } },
        },
      ];
      render(<CanvasPanel />);
      expect(screen.queryByText('Start Building')).toBeNull();
    });

    it('hides empty state with multiple nodes', () => {
      mockNodes = [
        {
          id: 'tool-1',
          type: 'toolNode',
          data: { tool: { id: 'tool-1', name: 'test', description: 'test', parameters: [] } },
        },
        {
          id: 'resource-1',
          type: 'resourceNode',
          data: { resource: { id: 'resource-1', name: 'res', uri: 'test://', mimeType: 'text/plain' } },
        },
      ];
      render(<CanvasPanel />);
      expect(screen.queryByText('Start Building')).toBeNull();
    });
  });

  describe('Initial Component State', () => {
    it('dialogs are initially closed', () => {
      render(<CanvasPanel />);
      // All dialogs should be closed initially
      expect(screen.queryByTestId('ai-generator')).toBeNull();
      expect(screen.queryByTestId('import-dialog')).toBeNull();
      expect(screen.queryByTestId('template-gallery')).toBeNull();
    });

    it('renders without crashing with empty edges', () => {
      mockEdges = [];
      render(<CanvasPanel />);
      expect(screen.getByTestId('react-flow')).toBeTruthy();
    });

    it('renders without crashing with existing edges', () => {
      mockNodes = [
        {
          id: 'tool-1',
          type: 'toolNode',
          data: { tool: { id: 'tool-1', name: 'test1', description: 'test', parameters: [] } },
        },
        {
          id: 'tool-2',
          type: 'toolNode',
          data: { tool: { id: 'tool-2', name: 'test2', description: 'test', parameters: [] } },
        },
      ];
      mockEdges = [{ id: 'edge-1', source: 'tool-1', target: 'tool-2' }];
      render(<CanvasPanel />);
      expect(screen.getByTestId('react-flow')).toBeTruthy();
    });
  });

  describe('Store Integration', () => {
    it('receives nodes from store', () => {
      mockNodes = [
        {
          id: 'tool-1',
          type: 'toolNode',
          data: { tool: { id: 'tool-1', name: 'my_tool', description: 'desc', parameters: [] } },
        },
      ];
      render(<CanvasPanel />);
      // The component renders, meaning it received nodes correctly
      expect(screen.queryByText('Start Building')).toBeNull();
    });

    it('receives edges from store', () => {
      mockEdges = [{ id: 'edge-1', source: 'a', target: 'b' }];
      render(<CanvasPanel />);
      expect(screen.getByTestId('react-flow')).toBeTruthy();
    });
  });
});
