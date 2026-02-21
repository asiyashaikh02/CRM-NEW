import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white p-12 rounded-[3.5rem] shadow-2xl space-y-6 border border-slate-100">
            <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 mx-auto">
              <ShieldAlert size={40} />
            </div>
            <h2 className="text-3xl font-black tracking-tight">System Interrupted</h2>
            <p className="text-slate-400 font-bold">A critical exception occurred in the core sequence. Data integrity remains intact.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 shadow-xl"
            >
              <RefreshCcw size={16} /> Reinitialize Core
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
