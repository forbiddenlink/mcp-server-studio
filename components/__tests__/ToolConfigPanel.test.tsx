import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolConfigPanel } from '../config/ToolConfigPanel';
import type { MCPTool } from '@/lib/types';

// ---- Mocks ----

const mockUpdateTool = vi.fn();
const mockDeleteTool = vi.fn();
const mockSelectNode = vi.fn();

let mockSelectedNodeId: string | null = null;
let mockTools: MCPTool[] = [];

vi.mock('@/lib/store/useStore', () => ({
  useStore: () => ({
    selectedNodeId: mockSelectedNodeId,
    tools: mockTools,
    updateTool: mockUpdateTool,
    deleteTool: mockDeleteTool,
    selectNode: mockSelectNode,
  }),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock CapabilitiesSection component
vi.mock('../config/CapabilitiesSection', () => ({
  CapabilitiesSection: () => <div data-testid="capabilities-section">Capabilities</div>,
}));

// ---- Helpers ----

function makeTool(overrides: Partial<MCPTool> = {}): MCPTool {
  return {
    id: 'tool-1',
    name: 'search_web',
    description: 'Search the web for results',
    icon: 'Search',
    parameters: [],
    ...overrides,
  };
}

// ---- Tests ----

describe('ToolConfigPanel', () => {
  beforeEach(() => {
    mockUpdateTool.mockClear();
    mockDeleteTool.mockClear();
    mockSelectNode.mockClear();
    mockSelectedNodeId = null;
    mockTools = [];
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  describe('Visibility', () => {
    it('does not render when no tool is selected', () => {
      mockSelectedNodeId = null;
      mockTools = [];
      render(<ToolConfigPanel />);
      expect(screen.queryByText('Configure Tool')).toBeNull();
    });

    it('does not render when selectedNodeId does not match any tool', () => {
      mockSelectedNodeId = 'tool-999';
      mockTools = [makeTool({ id: 'tool-1' })];
      render(<ToolConfigPanel />);
      expect(screen.queryByText('Configure Tool')).toBeNull();
    });

    it('renders when a tool is selected', () => {
      mockSelectedNodeId = 'tool-1';
      mockTools = [makeTool({ id: 'tool-1' })];
      render(<ToolConfigPanel />);
      expect(screen.getByText('Configure Tool')).toBeTruthy();
    });
  });

  describe('Header', () => {
    it('shows Configure Tool header', () => {
      mockSelectedNodeId = 'tool-1';
      mockTools = [makeTool()];
      render(<ToolConfigPanel />);
      expect(screen.getByText('Configure Tool')).toBeTruthy();
    });

    it('has close button with aria-label', () => {
      mockSelectedNodeId = 'tool-1';
      mockTools = [makeTool()];
      render(<ToolConfigPanel />);
      expect(screen.getByLabelText('Close configuration panel')).toBeTruthy();
    });

    it('calls selectNode(null) when close button is clicked', () => {
      mockSelectedNodeId = 'tool-1';
      mockTools = [makeTool()];
      render(<ToolConfigPanel />);
      fireEvent.click(screen.getByLabelText('Close configuration panel'));
      expect(mockSelectNode).toHaveBeenCalledWith(null);
    });
  });

  describe('Form Fields', () => {
    it('shows tool name input', () => {
      mockSelectedNodeId = 'tool-1';
      mockTools = [makeTool({ name: 'search_web' })];
      render(<ToolConfigPanel />);
      expect(screen.getByLabelText('Tool Name')).toBeTruthy();
    });

    it('shows tool description textarea', () => {
      mockSelectedNodeId = 'tool-1';
      mockTools = [makeTool({ description: 'Search the web' })];
      render(<ToolConfigPanel />);
      expect(screen.getByLabelText('Description')).toBeTruthy();
    });

    it('shows Parameters section', () => {
      mockSelectedNodeId = 'tool-1';
      mockTools = [makeTool()];
      render(<ToolConfigPanel />);
      expect(screen.getByText('Parameters')).toBeTruthy();
    });

    it('shows Add button for parameters', () => {
      mockSelectedNodeId = 'tool-1';
      mockTools = [makeTool()];
      render(<ToolConfigPanel />);
      expect(screen.getByText('Add')).toBeTruthy();
    });
  });

  describe('Empty Parameters State', () => {
    it('shows empty state when no parameters exist', () => {
      mockSelectedNodeId = 'tool-1';
      mockTools = [makeTool({ parameters: [] })];
      render(<ToolConfigPanel />);
      expect(screen.getByText('No parameters yet')).toBeTruthy();
      expect(screen.getByText('Click "Add" to add a parameter')).toBeTruthy();
    });
  });

  describe('Parameter Management', () => {
    it('shows parameter when tool has parameters', () => {
      mockSelectedNodeId = 'tool-1';
      mockTools = [
        makeTool({
          parameters: [
            { name: 'query', type: 'string', description: 'Search query', required: true },
          ],
        }),
      ];
      render(<ToolConfigPanel />);
      expect(screen.getByText('Parameter 1')).toBeTruthy();
    });

    it('shows multiple parameters with correct numbering', () => {
      mockSelectedNodeId = 'tool-1';
      mockTools = [
        makeTool({
          parameters: [
            { name: 'query', type: 'string', description: 'Query', required: true },
            { name: 'limit', type: 'number', description: 'Limit', required: false },
          ],
        }),
      ];
      render(<ToolConfigPanel />);
      expect(screen.getByText('Parameter 1')).toBeTruthy();
      expect(screen.getByText('Parameter 2')).toBeTruthy();
    });

    it('shows Required parameter checkbox', () => {
      mockSelectedNodeId = 'tool-1';
      mockTools = [
        makeTool({
          parameters: [
            { name: 'query', type: 'string', description: 'Query', required: true },
          ],
        }),
      ];
      render(<ToolConfigPanel />);
      expect(screen.getByText('Required parameter')).toBeTruthy();
    });
  });

  describe('Footer Actions', () => {
    it('shows Save Changes button', () => {
      mockSelectedNodeId = 'tool-1';
      mockTools = [makeTool()];
      render(<ToolConfigPanel />);
      expect(screen.getByText('Save Changes')).toBeTruthy();
    });

    it('shows Delete Tool button', () => {
      mockSelectedNodeId = 'tool-1';
      mockTools = [makeTool()];
      render(<ToolConfigPanel />);
      expect(screen.getByText('Delete Tool')).toBeTruthy();
    });

    it('calls updateTool when Save Changes is clicked', () => {
      mockSelectedNodeId = 'tool-1';
      mockTools = [makeTool()];
      render(<ToolConfigPanel />);
      fireEvent.click(screen.getByText('Save Changes'));
      expect(mockUpdateTool).toHaveBeenCalledWith('tool-1', expect.any(Object));
    });

    it('calls deleteTool and selectNode when Delete Tool is clicked', () => {
      mockSelectedNodeId = 'tool-1';
      mockTools = [makeTool()];
      render(<ToolConfigPanel />);
      fireEvent.click(screen.getByText('Delete Tool'));
      expect(mockDeleteTool).toHaveBeenCalledWith('tool-1');
      expect(mockSelectNode).toHaveBeenCalledWith(null);
    });

    it('does not delete when confirm is cancelled', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      mockSelectedNodeId = 'tool-1';
      mockTools = [makeTool()];
      render(<ToolConfigPanel />);
      fireEvent.click(screen.getByText('Delete Tool'));
      expect(mockDeleteTool).not.toHaveBeenCalled();
    });
  });

  describe('Capabilities Section', () => {
    it('renders CapabilitiesSection component', () => {
      mockSelectedNodeId = 'tool-1';
      mockTools = [makeTool()];
      render(<ToolConfigPanel />);
      expect(screen.getByTestId('capabilities-section')).toBeTruthy();
    });
  });

  describe('String Constraints', () => {
    it('shows String Constraints section for string parameters', () => {
      mockSelectedNodeId = 'tool-1';
      mockTools = [
        makeTool({
          parameters: [
            { name: 'query', type: 'string', description: 'Query', required: true },
          ],
        }),
      ];
      render(<ToolConfigPanel />);
      expect(screen.getByText('String Constraints')).toBeTruthy();
    });
  });

  describe('Number Constraints', () => {
    it('shows Number Constraints section for number parameters', () => {
      mockSelectedNodeId = 'tool-1';
      mockTools = [
        makeTool({
          parameters: [
            { name: 'limit', type: 'number', description: 'Limit', required: false },
          ],
        }),
      ];
      render(<ToolConfigPanel />);
      expect(screen.getByText('Number Constraints')).toBeTruthy();
    });
  });

  describe('Array Constraints', () => {
    it('shows Array Constraints section for array parameters', () => {
      mockSelectedNodeId = 'tool-1';
      mockTools = [
        makeTool({
          parameters: [
            { name: 'tags', type: 'array', description: 'Tags', required: false },
          ],
        }),
      ];
      render(<ToolConfigPanel />);
      expect(screen.getByText('Array Constraints')).toBeTruthy();
      expect(screen.getByText('Unique items only')).toBeTruthy();
    });
  });
});
