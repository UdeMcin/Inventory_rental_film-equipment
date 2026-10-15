import React from 'react';
import { useDepot } from '../context/DepotContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useDepot();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-slate-900/95 border-emerald-500/30 text-slate-100'
                : isWarning
                ? 'bg-slate-900/95 border-amber-500/30 text-slate-100'
                : isError
                ? 'bg-slate-900/95 border-red-500/30 text-slate-100'
                : 'bg-slate-900/95 border-indigo-500/30 text-slate-100'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {isError && <XCircle className="w-4 h-4 text-red-400" />}
              {!isSuccess && !isWarning && !isError && <Info className="w-4 h-4 text-indigo-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white tracking-tight">{toast.title}</p>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
