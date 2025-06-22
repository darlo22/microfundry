import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error!} />;
      }

      return (
        <div style={{ 
          padding: '20px', 
          color: 'red', 
          fontFamily: 'monospace',
          backgroundColor: '#fff',
          border: '1px solid #red',
          borderRadius: '4px',
          margin: '20px'
        }}>
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Error Details</summary>
            {this.state.error?.toString()}
            {this.state.error?.stack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorFallback({ error }: { error: Error }) {
  return (
    <div style={{ 
      padding: '20px', 
      color: 'red', 
      fontFamily: 'monospace',
      backgroundColor: '#fff',
      border: '1px solid red',
      borderRadius: '4px',
      margin: '20px'
    }}>
      <h2>Application Error</h2>
      <p>An error occurred while rendering this component:</p>
      <details style={{ whiteSpace: 'pre-wrap' }}>
        <summary>Error Details</summary>
        <pre>{error.toString()}</pre>
        <pre>{error.stack}</pre>
      </details>
    </div>
  );
}