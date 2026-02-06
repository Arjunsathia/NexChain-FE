import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-6">
          <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-xl">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h2>
            <p className="text-slate-400 mb-6 text-sm">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/';
                }}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
              >
                Reset & Home
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-8 text-left bg-black/50 p-4 rounded-lg overflow-auto max-h-48 text-xs font-mono text-red-300">
                <summary className="cursor-pointer mb-2">Error Details</summary>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
