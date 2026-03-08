import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../error-boundary';

// Suppress console.error for expected error outputs
const originalError = console.error;

beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalError;
});

// A component that throws on render
function ThrowingComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Normal content</div>;
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Child content')).toBeTruthy();
  });

  it('shows fallback UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('displays error message', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Test error message')).toBeTruthy();
  });

  it('shows custom label in error message', () => {
    render(
      <ErrorBoundary label="Canvas">
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('The Canvas panel encountered an error.')).toBeTruthy();
  });

  it('shows generic message without label', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('An unexpected error occurred.')).toBeTruthy();
  });

  it('shows retry button', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Try Again')).toBeTruthy();
  });

  it('logs error to console', () => {
    render(
      <ErrorBoundary label="Test">
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalled();
  });

  it('recovers from error on retry', () => {
    let shouldThrow = true;

    function ConditionalThrower() {
      if (shouldThrow) {
        throw new Error('Conditional error');
      }
      return <div>Recovered content</div>;
    }

    render(
      <ErrorBoundary>
        <ConditionalThrower />
      </ErrorBoundary>
    );

    // Initially in error state
    expect(screen.getByText('Something went wrong')).toBeTruthy();

    // Fix the condition and retry
    shouldThrow = false;
    fireEvent.click(screen.getByText('Try Again'));

    // Should now show normal content
    expect(screen.getByText('Recovered content')).toBeTruthy();
  });

  it('shows alert role for accessibility', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    // The error fallback should be accessible
    const alert = screen.getByRole('alert');
    expect(alert).toBeTruthy();
  });

  it('handles errors without message', () => {
    function ThrowNoMessage() {
      throw new Error();
    }

    render(
      <ErrorBoundary>
        <ThrowNoMessage />
      </ErrorBoundary>
    );

    // Should still render fallback
    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });
});
