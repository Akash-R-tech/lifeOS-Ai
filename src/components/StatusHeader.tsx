import React from "react";
import { ShieldAlert, ShieldCheck, Mail, Calendar, FolderGit2, Sparkles, Volume2, VolumeX, ListOrdered, KeyRound } from "lucide-react";
import { SystemHealth } from "../types";

interface StatusHeaderProps {
  health: SystemHealth | null;
  emergencyStop: boolean;
  onToggleEmergencyStop: () => void;
  voiceAudioEnabled: boolean;
  onToggleVoiceAudio: () => void;
  onOpenActionLogs: () => void;
  onOpenPermissions: () => void;
  unverifiedActionsCount: number;
}

export const StatusHeader: React.FC<StatusHeaderProps> = ({
  health,
  emergencyStop,
  onToggleEmergencyStop,
  voiceAudioEnabled,
  onToggleVoiceAudio,
  onOpenActionLogs,
  onOpenPermissions,
  unverifiedActionsCount,
}) => {
  return (
    <header id="lifeos-header" className="w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md px-4 py-3 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand & Autonomous Super Assistant Tag */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white">LifeOS AI</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                VOICE-FIRST SUPER ASSISTANT
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">Continuous observation · Autonomous action · Proactive intimation</p>
          </div>
        </div>

        {/* Middle: Connected Sources Badges */}
        <div className="hidden md:flex items-center gap-2 text-[11px] text-neutral-300">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800" title="Gmail API Connected">
            <Mail className="w-3.5 h-3.5 text-red-400" />
            <span>Gmail</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800" title="Google Calendar Synced">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Calendar</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800" title="Workspace Inodes Active">
            <FolderGit2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Workspace</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800" title="Gemini 3.8 Flash AI Model">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Gemini AI</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
        </div>

        {/* Right: Controls & Emergency Stop */}
        <div className="flex items-center gap-2">
          {/* TTS Audio toggle */}
          <button
            id="toggle-tts-audio"
            onClick={onToggleVoiceAudio}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title={voiceAudioEnabled ? "Voice Output Active" : "Voice Output Muted"}
          >
            {voiceAudioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
          </button>

          {/* Action Log Drawer Trigger */}
          <button
            id="open-action-logs"
            onClick={onOpenActionLogs}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <ListOrdered className="w-3.5 h-3.5 text-cyan-400" />
            <span>Action Log</span>
            {unverifiedActionsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300">
                {unverifiedActionsCount}
              </span>
            )}
          </button>

          {/* Permissions / Capabilities */}
          <button
            id="open-permissions"
            onClick={onOpenPermissions}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Permissions</span>
          </button>

          {/* Emergency Stop Kill Switch */}
          <button
            id="emergency-stop-button"
            onClick={onToggleEmergencyStop}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer ${
              emergencyStop
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 animate-pulse"
                : "bg-neutral-900 hover:bg-rose-950/40 text-rose-400 border border-rose-900/40"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{emergencyStop ? "STOP ACTIVE" : "EMERGENCY STOP"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
