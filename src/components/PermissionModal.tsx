import React from "react";
import { X, KeyRound, ShieldAlert, Check, Lock } from "lucide-react";

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  grantedCapabilities: string[];
  onToggleCapability: (cap: string) => void;
}

const ALL_CAPABILITIES = [
  { id: "READ_EMAIL", label: "Read Emails", desc: "Allow autonomous analysis of incoming emails" },
  { id: "READ_EMAIL_ATTACHMENTS", label: "Read Attachments", desc: "Parse PDF/doc assignment attachments" },
  { id: "SEND_EMAIL", label: "Draft & Send Routine Emails", desc: "Allows routine confirmations to professors" },
  { id: "READ_CALENDAR", label: "Read Calendar", desc: "Inspect classes, meetings, and free slots" },
  { id: "CREATE_CALENDAR_EVENT", label: "Update Schedule", desc: "Adjust planned focus blocks dynamically" },
  { id: "READ_FILES", label: "Read Local Files", desc: "Read project workspaces & documentation" },
  { id: "CREATE_FILES", label: "Create Files & Folders", desc: "Autonomous assignment workspace staging" },
  { id: "MODIFY_FILES", label: "Modify Files", desc: "Update READMEs and checklists" },
  { id: "OPEN_APPLICATIONS", label: "Open Applications", desc: "Launch code editors or presentation files" },
  { id: "VOICE_CONTROL", label: "Voice Output & Control", desc: "Speak intimations and transcribe microphone" },
  { id: "READ_CLASSROOM", label: "Google Classroom", desc: "Sync coursework and syllabi" },
  { id: "CREATE_TASKS", label: "Create Tasks", desc: "Break assignments into scheduled subtasks" },
  { id: "MODIFY_TASKS", label: "Modify Tasks", desc: "Update progress and priorities" },
  { id: "AUTOMATIC_REMINDERS", label: "Proactive Reminders", desc: "Speak when forgotten work is at risk" },
  { id: "AI_ASSIGNMENT_ASSISTANCE", label: "Academic Assistance", desc: "Decompose questions and assist work" },
];

export const PermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  onClose,
  grantedCapabilities,
  onToggleCapability,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Capability-Based Permission Engine</h2>
              <p className="text-xs text-neutral-400">Permissions are granted by capability rather than repeatedly interrupting the user</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Safety Barrier Banner */}
        <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-amber-200">
            <strong>Mandatory Human Confirmation:</strong> High-impact actions (final academic submissions, financial transactions, deleting files) are strictly blocked by code and cannot be executed autonomously without explicit user confirmation.
          </div>
        </div>

        {/* Capability List */}
        <div className="p-6 overflow-y-auto space-y-2">
          {ALL_CAPABILITIES.map((cap) => {
            const isGranted = grantedCapabilities.includes(cap.id);
            return (
              <div
                key={cap.id}
                onClick={() => onToggleCapability(cap.id)}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{cap.label}</span>
                    <span className="text-[9px] font-mono text-neutral-500">{cap.id}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{cap.desc}</p>
                </div>

                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                    isGranted ? "bg-emerald-600 text-white" : "bg-neutral-800 text-neutral-500"
                  }`}
                >
                  {isGranted && <Check className="w-4 h-4" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
