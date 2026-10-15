import React from 'react';
import { useDepot } from '../context/DepotContext';
import { Cloud, CloudOff, RefreshCw, X, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface SyncQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncQueueModal: React.FC<SyncQueueModalProps> = ({ isOpen, onClose }) => {
  const { syncQueue, effectiveOnline, lastSyncTime, syncNow, isOfflineSimulated, toggleOfflineSimulation } = useDepot();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${effectiveOnline ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
              {effectiveOnline ? <Cloud className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Depot Cloud Synchronization & Offline Queue
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Status: {effectiveOnline ? 'Connected to University Cloud Server' : 'Working Offline in Remote Set Mode'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[11px]">Last Cloud Sync:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{lastSyncTime}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Pending Buffer:</span>
              <span className={`font-bold ${syncQueue.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {syncQueue.length} Mutation(s)
              </span>
            </div>
            <button
              onClick={syncNow}
              disabled={!effectiveOnline || syncQueue.length === 0}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reconcile Now</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Buffered Offline Actions:
              </span>
              <button
                type="button"
                onClick={toggleOfflineSimulation}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {isOfflineSimulated ? 'Exit Simulated Field Mode' : 'Simulate Offline Remote Set'}
              </button>
            </div>

            {syncQueue.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                <p className="font-medium text-slate-700 dark:text-slate-300">All depot actions are fully synchronized</p>
                <p className="text-[11px] text-slate-500">
                  Any check-outs, returns, digital signatures, or damage reports performed while offline on location will buffer here.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {syncQueue.map(item => (
                  <div
                    key={item.id}
                    className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1 font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase text-indigo-600 dark:text-indigo-400">
                        {item.action.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-xs">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
