'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Label shown in the fallback UI (e.g. "Canvas", "Preview") */
  label?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render errors in child components and shows a styled fallback
 * instead of crashing the entire app.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.label ? `: ${this.props.label}` : ''}]`, error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center" role="alert">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
            Something went wrong
          </h3>
          <p className="text-xs text-[var(--text-tertiary)] mb-4 max-w-xs">
            {this.props.label
              ? `The ${this.props.label} panel encountered an error.`
              : 'An unexpected error occurred.'}
          </p>
          {this.state.error && (
            <p className="text-xs text-red-400/80 mb-4 font-mono max-w-xs truncate">
              {this.state.error.message}
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleRetry}
            className="gap-2"
          >
            <RefreshCw className="w-3 h-3" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
