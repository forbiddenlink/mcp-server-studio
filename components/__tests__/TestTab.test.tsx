import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestTab } from '../preview/TestTab';
import type { MCPTool, MCPResource, MCPPrompt } from '@/lib/types';

// ---- Mocks ----

let mockTools: MCPTool[] = [];
let mockResources: MCPResource[] = [];
let mockPrompts: MCPPrompt[] = [];

vi.mock('@/lib/store/useStore', () => ({
  useStore: () => ({
    tools: mockTools,
    resources: mockResources,
    prompts: mockPrompts,
  }),
}));

// ---- Fixtures ----

function makeTool(overrides: Partial<MCPTool> = {}): MCPTool {
  return {
    id: 'tool-1',
    name: 'search_web',
    description: 'Search the web',
    icon: 'Search',
    parameters: [
      { name: 'query', type: 'string', description: 'search term', required: true },
    ],
    ...overrides,
  };
}

function makeResource(overrides: Partial<MCPResource> = {}): MCPResource {
  return {
    id: 'resource-1',
    name: 'readme',
    description: 'Project readme',
    uri: 'file://README.md',
    mimeType: 'text/plain',
    ...overrides,
  };
}

function makePrompt(overrides: Partial<MCPPrompt> = {}): MCPPrompt {
  return {
    id: 'prompt-1',
    name: 'summarize',
    description: 'Summarize text',
    arguments: [
      { name: 'text', type: 'string', description: 'text to summarize', required: true },
    ],
    ...overrides,
  };
}

// ---- Tests ----

describe('TestTab', () => {
  beforeEach(() => {
    mockTools = [];
    mockResources = [];
    mockPrompts = [];
  });

  it('shows empty state when no items exist', () => {
    render(<TestTab />);
    expect(screen.getByText('No items to test')).toBeTruthy();
    expect(screen.getByText('Add tools, resources, or prompts to start testing')).toBeTruthy();
  });

  it('renders tool items in the list', () => {
    mockTools = [makeTool()];
    render(<TestTab />);
    expect(screen.getByText('search_web')).toBeTruthy();
    expect(screen.getByText('Search the web')).toBeTruthy();
    expect(screen.getByText(/Tools \(1\)/)).toBeTruthy();
  });

  it('renders resource items in the list', () => {
    mockResources = [makeResource()];
    render(<TestTab />);
    expect(screen.getByText('readme')).toBeTruthy();
    expect(screen.getByText(/Resources \(1\)/)).toBeTruthy();
  });

  it('renders prompt items in the list', () => {
    mockPrompts = [makePrompt()];
    render(<TestTab />);
    expect(screen.getByText('summarize')).toBeTruthy();
    expect(screen.getByText(/Prompts \(1\)/)).toBeTruthy();
  });

  it('navigates to detail view when a tool is clicked', () => {
    mockTools = [makeTool()];
    render(<TestTab />);
    // Click the tool row
    fireEvent.click(screen.getByText('search_web'));
    // Detail view shows the tool name as heading and a "Run Test" button
    expect(screen.getByText('Run Test')).toBeTruthy();
    // Parameters should be visible
    expect(screen.getByText('Parameters')).toBeTruthy();
  });

  it('shows "Test All" button and renders batch results', async () => {
    mockTools = [makeTool()];
    render(<TestTab />);

    const testAllBtn = screen.getByText('Test All');
    expect(testAllBtn).toBeTruthy();

    fireEvent.click(testAllBtn);

    // Wait for the async batch validation to finish
    await waitFor(() => {
      expect(screen.getByText('Validation Results')).toBeTruthy();
    });

    // Should show passed/failed counts
    expect(screen.getByText(/passed/)).toBeTruthy();
  });

  it('shows Test Inspector heading', () => {
    mockTools = [makeTool()];
    render(<TestTab />);
    expect(screen.getByText('Test Inspector')).toBeTruthy();
  });

  it('renders all three item types simultaneously', () => {
    mockTools = [makeTool()];
    mockResources = [makeResource()];
    mockPrompts = [makePrompt()];
    render(<TestTab />);
    expect(screen.getByText(/Tools \(1\)/)).toBeTruthy();
    expect(screen.getByText(/Resources \(1\)/)).toBeTruthy();
    expect(screen.getByText(/Prompts \(1\)/)).toBeTruthy();
  });
});
