import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StructureTab } from '../preview/StructureTab';
import type { MCPServerConfig } from '@/lib/types';

// ---- Mocks ----

let mockConfig: MCPServerConfig;

vi.mock('@/lib/store/useStore', () => ({
  useStore: () => ({ serverConfig: mockConfig }),
}));

// ---- Helpers ----

function emptyConfig(): MCPServerConfig {
  return {
    name: 'test-server',
    version: '1.0.0',
    transport: 'stdio',
    httpPort: 3000,
    tools: [],
    resources: [],
    prompts: [],
  };
}

function configWithTool(): MCPServerConfig {
  return {
    ...emptyConfig(),
    tools: [
      {
        id: 'tool-1',
        name: 'search_web',
        description: 'Search the web',
        icon: 'Search',
        parameters: [
          { name: 'query', type: 'string', description: 'search term', required: true },
        ],
      },
    ],
  };
}

// ---- Tests ----

describe('StructureTab', () => {
  beforeEach(() => {
    mockConfig = emptyConfig();
  });

  it('shows empty state when there are no tools', () => {
    render(<StructureTab />);
    expect(screen.getByText('No tools yet')).toBeTruthy();
    expect(screen.getByText('Add tools to see the server manifest')).toBeTruthy();
  });

  it('renders the manifest JSON when tools exist', () => {
    mockConfig = configWithTool();
    render(<StructureTab />);
    // The manifest should contain the tool name
    expect(screen.getByText(/search_web/)).toBeTruthy();
  });

  it('renders the heading "Server Manifest"', () => {
    render(<StructureTab />);
    expect(screen.getByText('Server Manifest')).toBeTruthy();
  });

  it('disables copy button when no tools exist', () => {
    render(<StructureTab />);
    const buttons = screen.getAllByRole('button');
    const copyBtn = buttons.find((btn) => !btn.textContent);
    expect(copyBtn).toBeTruthy();
    expect(copyBtn!.hasAttribute('disabled')).toBe(true);
  });

  it('calls clipboard.writeText on copy click', () => {
    mockConfig = configWithTool();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<StructureTab />);
    const buttons = screen.getAllByRole('button');
    // Copy button is the icon-only button
    fireEvent.click(buttons[0]);
    expect(writeText).toHaveBeenCalled();
    const written = writeText.mock.calls[0][0] as string;
    expect(written).toContain('search_web');
  });
});
