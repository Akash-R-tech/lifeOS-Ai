import React from "react";
import { X, CheckCircle2, AlertCircle, Shield, FileCode2, Clock, Sparkles } from "lucide-react";
import { ActionLog } from "../types";

interface ActionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ActionLog[];
}

export const ActionLogModal: React.FC<ActionLogModalProps> = ({
  isOpen,
  onClose,
  logs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Autonomous Action Log & Verification Ledger</h2>
              <p className="text-xs text-neutral-400">All actions executed by the controlled computer agent with capability checks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-xs">
              No actions executed yet. Speak to LifeOS or trigger an autonomous event.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {log.action}
                    </span>
                    <span className="text-xs font-semibold text-white">{log.target}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-mono bg-neutral-800 text-neutral-300">
                      <Shield className="w-3 h-3 text-amber-400" />
                      {log.permission}
                    </span>
                    {log.verified ? (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        VERIFIED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-mono bg-rose-950/60 text-rose-400 border border-rose-800/40">
                        <AlertCircle className="w-3 h-3 text-rose-400" />
                        UNVERIFIED
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-400 pt-2 border-t border-neutral-800/60">
                  <div>
                    <span className="text-neutral-500">Trigger:</span> <span className="text-neutral-300">{log.trigger}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-neutral-500" />
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                {log.details && (
                  <pre className="mt-2 p-2 rounded bg-neutral-900 text-[10px] font-mono text-neutral-300 overflow-x-auto">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
