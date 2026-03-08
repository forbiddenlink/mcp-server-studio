import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AIGenerator } from '../ai-generator';

// ---- Mocks ----

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the aiToolGenerator
vi.mock('@/lib/generators/aiToolGenerator', () => ({
  parseToolDescription: vi.fn((desc: string) => ({
    id: `tool-${Date.now()}`,
    name: 'generated_tool',
    description: desc,
    icon: 'Sparkles',
    parameters: [
      { name: 'input', type: 'string', description: 'Input value', required: true },
    ],
  })),
  analyzeDescription: vi.fn((desc: string) => ({
    confidence: desc.length > 30 ? 0.8 : 0.3,
    suggestions: desc.length < 20 ? ['Add more detail'] : [],
  })),
}));

// ---- Tests ----

describe('AIGenerator', () => {
  const mockOnClose = vi.fn();
  const mockOnGenerate = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnGenerate.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Visibility', () => {
    it('does not render when isOpen is false', () => {
      render(
        <AIGenerator isOpen={false} onClose={mockOnClose} onGenerate={mockOnGenerate} />
      );
      expect(screen.queryByText('Generate Tool with AI')).toBeNull();
    });

    it('renders when isOpen is true', () => {
      render(
        <AIGenerator isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />
      );
      expect(screen.getByText('Generate Tool with AI')).toBeTruthy();
    });
  });

  describe('Header', () => {
    it('shows header title', () => {
      render(
        <AIGenerator isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />
      );
      expect(screen.getByText('Generate Tool with AI')).toBeTruthy();
    });

    it('shows header description', () => {
      render(
        <AIGenerator isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />
      );
      expect(screen.getByText('Describe what you want and we will create it')).toBeTruthy();
    });

    it('has close button that calls onClose', () => {
      render(
        <AIGenerator isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />
      );
      // Find the X button in the header
      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find(btn => btn.querySelector('svg.lucide-x'));
      expect(closeButton).toBeTruthy();
      fireEvent.click(closeButton!);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Input Section', () => {
    it('shows textarea for description input', () => {
      render(
        <AIGenerator isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />
      );
      expect(screen.getByPlaceholderText('Describe your tool in natural language...')).toBeTruthy();
    });

    it('shows example prompts section when no description', () => {
      render(
        <AIGenerator isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />
      );
      expect(screen.getByText('Try an example')).toBeTruthy();
    });

    it('shows example prompt buttons', () => {
      render(
        <AIGenerator isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />
      );
      // First 3 example prompts should be visible
      expect(screen.getByText(/database for users/)).toBeTruthy();
    });
  });

  describe('Generate Button', () => {
    it('shows Generate Tool button', () => {
      render(
        <AIGenerator isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />
      );
      expect(screen.getByText('Generate Tool')).toBeTruthy();
    });

    it('Generate button is disabled when description is empty', () => {
      render(
        <AIGenerator isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />
      );
      const button = screen.getByText('Generate Tool').closest('button');
      expect(button?.disabled).toBe(true);
    });

    it('Generate button is disabled when description is too short', () => {
      render(
        <AIGenerator isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />
      );
      const textarea = screen.getByPlaceholderText('Describe your tool in natural language...');
      fireEvent.change(textarea, { target: { value: 'ab' } });

      const button = screen.getByText('Generate Tool').closest('button');
      expect(button?.disabled).toBe(true);
    });

    it('Generate button is enabled when description is valid', () => {
      render(
        <AIGenerator isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />
      );
      const textarea = screen.getByPlaceholderText('Describe your tool in natural language...');
      fireEvent.change(textarea, { target: { value: 'A tool that searches for users' } });

      const button = screen.getByText('Generate Tool').closest('button');
      expect(button?.disabled).toBe(false);
    });
  });

  describe('Example Prompts', () => {
    it('clicking example prompt fills textarea', () => {
      render(
        <AIGenerator isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />
      );
      const exampleButton = screen.getByText(/database for users/);
      fireEvent.click(exampleButton);

      const textarea = screen.getByPlaceholderText('Describe your tool in natural language...') as HTMLTextAreaElement;
      expect(textarea.value).toContain('database');
    });
  });

  describe('Footer', () => {
    it('shows footer with powered by text', () => {
      render(
        <AIGenerator isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />
      );
      expect(screen.getByText('Powered by smart pattern matching')).toBeTruthy();
    });

    it('shows Esc keyboard hint', () => {
      render(
        <AIGenerator isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />
      );
      expect(screen.getByText('Esc')).toBeTruthy();
      expect(screen.getByText('close')).toBeTruthy();
    });
  });

  describe('Tool Generation Flow', async () => {
    it('shows generating state when clicked', async () => {
      render(
        <AIGenerator isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />
      );

      const textarea = screen.getByPlaceholderText('Describe your tool in natural language...');
      fireEvent.change(textarea, { target: { value: 'A tool that searches for users by email' } });

      const button = screen.getByText('Generate Tool').closest('button')!;
      fireEvent.click(button);

      expect(screen.getByText('Generating...')).toBeTruthy();
    });

    it('shows generated tool after generation completes', async () => {
      vi.useRealTimers(); // Use real timers for this test

      render(
        <AIGenerator isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />
      );

      const textarea = screen.getByPlaceholderText('Describe your tool in natural language...');
      fireEvent.change(textarea, { target: { value: 'A tool that searches for users by email' } });

      const button = screen.getByText('Generate Tool').closest('button')!;
      fireEvent.click(button);

      // Wait for the generation to complete (600ms delay in component)
      await waitFor(() => {
        expect(screen.getByText('Tool generated successfully!')).toBeTruthy();
      }, { timeout: 1000 });
    });

    it('shows Add Tool to Canvas button after generation', async () => {
      vi.useRealTimers();

      render(
        <AIGenerator isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />
      );

      const textarea = screen.getByPlaceholderText('Describe your tool in natural language...');
      fireEvent.change(textarea, { target: { value: 'A tool that searches for users' } });

      const button = screen.getByText('Generate Tool').closest('button')!;
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Add Tool to Canvas')).toBeTruthy();
      }, { timeout: 1000 });
    });

    it('shows Go back and edit button after generation', async () => {
      vi.useRealTimers();

      render(
        <AIGenerator isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />
      );

      const textarea = screen.getByPlaceholderText('Describe your tool in natural language...');
      fireEvent.change(textarea, { target: { value: 'A tool that searches for users' } });

      fireEvent.click(screen.getByText('Generate Tool').closest('button')!);

      await waitFor(() => {
        expect(screen.getByText('Go back and edit')).toBeTruthy();
      }, { timeout: 1000 });
    });

    it('calls onGenerate and onClose when Add Tool to Canvas is clicked', async () => {
      vi.useRealTimers();

      render(
        <AIGenerator isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />
      );

      const textarea = screen.getByPlaceholderText('Describe your tool in natural language...');
      fireEvent.change(textarea, { target: { value: 'A tool that searches for users' } });

      fireEvent.click(screen.getByText('Generate Tool').closest('button')!);

      await waitFor(() => {
        expect(screen.getByText('Add Tool to Canvas')).toBeTruthy();
      }, { timeout: 1000 });

      fireEvent.click(screen.getByText('Add Tool to Canvas').closest('button')!);

      expect(mockOnGenerate).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Backdrop', () => {
    it('clicking backdrop calls onClose', () => {
      render(
        <AIGenerator isOpen={true} onClose={mockOnClose} onGenerate={mockOnGenerate} />
      );
      // Find backdrop div (first motion.div with bg-black/50)
      const backdrop = document.querySelector('.bg-black\\/50');
      expect(backdrop).toBeTruthy();
      fireEvent.click(backdrop!);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
