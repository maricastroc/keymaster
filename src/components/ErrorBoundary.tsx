import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

/**
 * Catches render-time errors anywhere in the tree and shows a recoverable
 * fallback instead of a blank white screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="font-mono text-lg text-neutral-300">Something went wrong.</h1>
          <p className="font-mono text-sm text-neutral-500 max-w-sm">
            An unexpected error occurred. Reloading usually fixes it.
          </p>
          <button
            onClick={this.handleReload}
            className="cursor-pointer rounded-lg border border-neutral-700 px-4 py-2 font-mono text-sm text-neutral-400 hover:border-neutral-500 hover:text-neutral-300 transition-colors"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
