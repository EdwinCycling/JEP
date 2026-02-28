import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-exact-beige flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-exact-red">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-6">
              <AlertTriangle className="w-8 h-8 text-exact-red" />
            </div>
            <h1 className="text-2xl font-heading font-semibold text-exact-dark mb-4">
              Oeps! Er ging iets mis.
            </h1>
            <p className="text-gray-600 font-sans mb-6">
              Er is een onverwachte fout opgetreden in de applicatie. Geen zorgen, je data is veilig opgeslagen in het geheugen.
            </p>
            <div className="bg-red-50 p-4 rounded-xl mb-6 text-left overflow-hidden">
              <p className="text-xs font-mono text-red-700 break-words">
                {this.state.error?.message}
              </p>
            </div>
            <div className="flex flex-col space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-exact-red text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-md"
              >
                <RefreshCcw className="w-5 h-5 mr-2" />
                Pagina verversen
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
              >
                <Home className="w-5 h-5 mr-2" />
                Terug naar start
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
