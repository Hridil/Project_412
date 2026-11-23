import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-xl mx-auto my-12 rounded-2xl bg-white dark:bg-[#14292a] border border-rose-200 dark:border-rose-900/60 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl">healing</span>
          </div>
          <h2 className="font-serif text-xl font-bold text-[#14302c] dark:text-[#e3efec]">
            Notice in Clinical View
          </h2>
          <p className="text-xs text-[#5f7571] dark:text-[#8fa8a3] leading-relaxed">
            A temporary view error occurred. The application remains protected, and your session is intact.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.hash = '';
                window.location.reload();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold cursor-pointer shadow-xs transition"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Reload Sanctuary</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
