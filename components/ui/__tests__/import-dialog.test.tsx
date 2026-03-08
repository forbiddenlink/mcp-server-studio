import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImportDialog } from '../import-dialog';

// ---- Mocks ----

const mockParseOpenApiSpec = vi.fn();
const mockFetchAndParseOpenApiSpec = vi.fn();

vi.mock('@/lib/importers/openApiImporter', () => ({
  parseOpenApiSpec: (spec: string) => mockParseOpenApiSpec(spec),
  fetchAndParseOpenApiSpec: (url: string) => mockFetchAndParseOpenApiSpec(url),
}));

// ---- Helpers ----

function makeParseResult(toolCount: number = 2, errors: string[] = [], warnings: string[] = []) {
  const tools = Array.from({ length: toolCount }, (_, i) => ({
    id: `tool-${i}`,
    name: `tool_${i}`,
    description: `Description for tool ${i}`,
    icon: 'Terminal',
    parameters: [
      { name: 'param1', type: 'string', description: 'Parameter 1', required: true },
    ],
  }));

  return {
    success: errors.length === 0,
    tools,
    errors,
    warnings,
  };
}

// ---- Tests ----

describe('ImportDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnImport = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnImport.mockClear();
    mockParseOpenApiSpec.mockClear();
    mockFetchAndParseOpenApiSpec.mockClear();
  });

  describe('Visibility', () => {
    it('does not render when isOpen is false', () => {
      render(
        <ImportDialog isOpen={false} onClose={mockOnClose} onImport={mockOnImport} />
      );
      expect(screen.queryByText('Import from OpenAPI')).toBeNull();
    });

    it('renders when isOpen is true', () => {
      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );
      expect(screen.getByText('Import from OpenAPI')).toBeTruthy();
    });
  });

  describe('Header', () => {
    it('shows header title', () => {
      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );
      expect(screen.getByText('Import from OpenAPI')).toBeTruthy();
    });

    it('shows input state description initially', () => {
      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );
      expect(screen.getByText('Paste your OpenAPI spec or provide a URL')).toBeTruthy();
    });

    it('has close button that calls onClose', () => {
      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );
      // Find the X button in the header
      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find(btn => btn.querySelector('svg.lucide-x'));
      expect(closeButton).toBeTruthy();
      fireEvent.click(closeButton!);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Tabs', () => {
    it('shows Paste Spec tab', () => {
      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );
      expect(screen.getByText('Paste Spec')).toBeTruthy();
    });

    it('shows From URL tab', () => {
      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );
      expect(screen.getByText('From URL')).toBeTruthy();
    });

    it('shows textarea for pasting when Paste Spec tab is active', () => {
      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );
      expect(screen.getByPlaceholderText(/Paste your OpenAPI\/Swagger spec here/)).toBeTruthy();
    });

    it('has clickable From URL tab', () => {
      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );
      const urlTab = screen.getByText('From URL');
      // Tab should be clickable
      expect(urlTab.closest('button')).toBeTruthy();
    });
  });

  describe('Footer Buttons - Input State', () => {
    it('shows Cancel button', () => {
      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );
      expect(screen.getByText('Cancel')).toBeTruthy();
    });

    it('shows Parse Spec button', () => {
      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );
      expect(screen.getByText('Parse Spec')).toBeTruthy();
    });

    it('Cancel button calls onClose', () => {
      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );
      fireEvent.click(screen.getByText('Cancel'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('Parse Spec button is disabled when textarea is empty', () => {
      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );
      const parseButton = screen.getByText('Parse Spec').closest('button');
      expect(parseButton?.disabled).toBe(true);
    });

    it('Parse Spec button is enabled when textarea has content', () => {
      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );
      const textarea = screen.getByPlaceholderText(/Paste your OpenAPI\/Swagger spec here/);
      fireEvent.change(textarea, { target: { value: '{"openapi": "3.0.0"}' } });

      const parseButton = screen.getByText('Parse Spec').closest('button');
      expect(parseButton?.disabled).toBe(false);
    });

    it('Parse Spec button state depends on paste content', () => {
      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );

      // Initially disabled (empty)
      expect(screen.getByText('Parse Spec').closest('button')?.disabled).toBe(true);

      // Enter content
      const textarea = screen.getByPlaceholderText(/Paste your OpenAPI\/Swagger spec here/);
      fireEvent.change(textarea, { target: { value: '{"openapi": "3.0.0"}' } });

      // Now enabled
      expect(screen.getByText('Parse Spec').closest('button')?.disabled).toBe(false);

      // Clear content
      fireEvent.change(textarea, { target: { value: '' } });

      // Disabled again
      expect(screen.getByText('Parse Spec').closest('button')?.disabled).toBe(true);
    });
  });

  describe('Parsing Flow', () => {
    it('calls parseOpenApiSpec when Parse Spec is clicked with paste content', async () => {
      mockParseOpenApiSpec.mockReturnValue(makeParseResult());

      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );

      const textarea = screen.getByPlaceholderText(/Paste your OpenAPI\/Swagger spec here/);
      fireEvent.change(textarea, { target: { value: '{"openapi": "3.0.0"}' } });

      fireEvent.click(screen.getByText('Parse Spec'));

      await waitFor(() => {
        expect(mockParseOpenApiSpec).toHaveBeenCalledWith('{"openapi": "3.0.0"}');
      });
    });

    it('handles parse result with tools correctly', async () => {
      mockParseOpenApiSpec.mockReturnValue(makeParseResult(3));

      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );

      const textarea = screen.getByPlaceholderText(/Paste your OpenAPI\/Swagger spec here/);
      fireEvent.change(textarea, { target: { value: '{"openapi": "3.0.0"}' } });

      fireEvent.click(screen.getByText('Parse Spec'));

      await waitFor(() => {
        expect(screen.getByText('Found 3 tools')).toBeTruthy();
      });
    });

    it('shows header description change during loading', async () => {
      // When in loading state, the header description changes
      mockParseOpenApiSpec.mockReturnValue(makeParseResult());

      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );

      // Initially shows input state description
      expect(screen.getByText('Paste your OpenAPI spec or provide a URL')).toBeTruthy();

      // After parsing, shows preview state description
      const textarea = screen.getByPlaceholderText(/Paste your OpenAPI\/Swagger spec here/);
      fireEvent.change(textarea, { target: { value: '{"openapi": "3.0.0"}' } });
      fireEvent.click(screen.getByText('Parse Spec'));

      await waitFor(() => {
        expect(screen.getByText('Select tools to import')).toBeTruthy();
      });
    });
  });

  describe('Preview State', () => {
    beforeEach(() => {
      mockParseOpenApiSpec.mockReturnValue(makeParseResult(2));
    });

    it('shows success message when parsing succeeds', async () => {
      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );

      const textarea = screen.getByPlaceholderText(/Paste your OpenAPI\/Swagger spec here/);
      fireEvent.change(textarea, { target: { value: '{}' } });
      fireEvent.click(screen.getByText('Parse Spec'));

      await waitFor(() => {
        expect(screen.getByText('Found 2 tools')).toBeTruthy();
      });
    });

    it('shows tool selection count', async () => {
      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );

      const textarea = screen.getByPlaceholderText(/Paste your OpenAPI\/Swagger spec here/);
      fireEvent.change(textarea, { target: { value: '{}' } });
      fireEvent.click(screen.getByText('Parse Spec'));

      await waitFor(() => {
        expect(screen.getByText('2 of 2 selected')).toBeTruthy();
      });
    });

    it('shows Select All and Deselect All buttons', async () => {
      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );

      const textarea = screen.getByPlaceholderText(/Paste your OpenAPI\/Swagger spec here/);
      fireEvent.change(textarea, { target: { value: '{}' } });
      fireEvent.click(screen.getByText('Parse Spec'));

      await waitFor(() => {
        expect(screen.getByText('Select All')).toBeTruthy();
        expect(screen.getByText('Deselect All')).toBeTruthy();
      });
    });

    it('shows Back button in preview state', async () => {
      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );

      const textarea = screen.getByPlaceholderText(/Paste your OpenAPI\/Swagger spec here/);
      fireEvent.change(textarea, { target: { value: '{}' } });
      fireEvent.click(screen.getByText('Parse Spec'));

      await waitFor(() => {
        expect(screen.getByText('Back')).toBeTruthy();
      });
    });

    it('shows Add Tools button with count', async () => {
      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );

      const textarea = screen.getByPlaceholderText(/Paste your OpenAPI\/Swagger spec here/);
      fireEvent.change(textarea, { target: { value: '{}' } });
      fireEvent.click(screen.getByText('Parse Spec'));

      await waitFor(() => {
        expect(screen.getByText('Add 2 Tools')).toBeTruthy();
      });
    });

    it('Deselect All updates the selection count', async () => {
      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );

      const textarea = screen.getByPlaceholderText(/Paste your OpenAPI\/Swagger spec here/);
      fireEvent.change(textarea, { target: { value: '{}' } });
      fireEvent.click(screen.getByText('Parse Spec'));

      await waitFor(() => {
        expect(screen.getByText('2 of 2 selected')).toBeTruthy();
      });

      fireEvent.click(screen.getByText('Deselect All'));
      expect(screen.getByText('0 of 2 selected')).toBeTruthy();
    });

    it('Add Tools button is disabled when no tools selected', async () => {
      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );

      const textarea = screen.getByPlaceholderText(/Paste your OpenAPI\/Swagger spec here/);
      fireEvent.change(textarea, { target: { value: '{}' } });
      fireEvent.click(screen.getByText('Parse Spec'));

      await waitFor(() => {
        expect(screen.getByText('Deselect All')).toBeTruthy();
      });

      fireEvent.click(screen.getByText('Deselect All'));

      const addButton = screen.getByText('Add 0 Tools').closest('button');
      expect(addButton?.disabled).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('shows errors when parsing fails', async () => {
      mockParseOpenApiSpec.mockReturnValue(makeParseResult(0, ['Invalid JSON']));

      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );

      const textarea = screen.getByPlaceholderText(/Paste your OpenAPI\/Swagger spec here/);
      fireEvent.change(textarea, { target: { value: 'invalid' } });
      fireEvent.click(screen.getByText('Parse Spec'));

      await waitFor(() => {
        expect(screen.getByText('Errors')).toBeTruthy();
        expect(screen.getByText('Invalid JSON')).toBeTruthy();
      });
    });

    it('shows warnings when present', async () => {
      mockParseOpenApiSpec.mockReturnValue(makeParseResult(2, [], ['Some warning']));

      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );

      const textarea = screen.getByPlaceholderText(/Paste your OpenAPI\/Swagger spec here/);
      fireEvent.change(textarea, { target: { value: '{}' } });
      fireEvent.click(screen.getByText('Parse Spec'));

      await waitFor(() => {
        expect(screen.getByText('Warnings')).toBeTruthy();
        expect(screen.getByText('Some warning')).toBeTruthy();
      });
    });
  });

  describe('Import Flow', () => {
    it('calls onImport with selected tools when Add Tools is clicked', async () => {
      mockParseOpenApiSpec.mockReturnValue(makeParseResult(2));

      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );

      const textarea = screen.getByPlaceholderText(/Paste your OpenAPI\/Swagger spec here/);
      fireEvent.change(textarea, { target: { value: '{}' } });
      fireEvent.click(screen.getByText('Parse Spec'));

      await waitFor(() => {
        expect(screen.getByText('Add 2 Tools')).toBeTruthy();
      });

      fireEvent.click(screen.getByText('Add 2 Tools'));

      expect(mockOnImport).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'tool-0' }),
          expect.objectContaining({ id: 'tool-1' }),
        ])
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Backdrop', () => {
    it('clicking backdrop calls onClose', () => {
      render(
        <ImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
      );
      const backdrop = document.querySelector('.bg-black\\/50');
      expect(backdrop).toBeTruthy();
      fireEvent.click(backdrop!);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
