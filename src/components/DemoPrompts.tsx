import React from "react";
import { Mic, Zap, Mail, Calendar, Clock, AlertTriangle, Play } from "lucide-react";

interface DemoPromptsProps {
  onSelectPrompt: (promptText: string) => void;
  onSimulateEvent: (type: string, data?: any) => void;
  disabled?: boolean;
}

export const DemoPrompts: React.FC<DemoPromptsProps> = ({
  onSelectPrompt,
  onSimulateEvent,
  disabled,
}) => {
  const VOICE_COMMANDS = [
    { text: "Mapla, enna pending?", label: "Pending Tasks & Status", icon: "🎙️" },
    { text: "Complete the work.", label: "Autonomous AI Solver & Report", icon: "⚡" },
    { text: "Check Google Classroom.", label: "Active Courses & Coursework", icon: "🎓" },
    { text: "What am I forgetting?", label: "Forgotten Work Detection", icon: "🧠" },
    { text: "What should I do now?", label: "Priority Recommendation", icon: "🎯" },
    { text: "What happens if I postpone this?", label: "What-If Simulator", icon: "⏳" },
    { text: "Tell my professor I'll submit tonight.", label: "Safe Email Draft", icon: "✉️" },
  ];

  return (
    <div id="demo-prompts-container" className="w-full max-w-4xl mx-auto px-4 mt-6">
      {/* Voice Commands Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
            Quick Voice Invocations (Click to speak or simulate query)
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {VOICE_COMMANDS.map((cmd) => (
            <button
              key={cmd.text}
              disabled={disabled}
              onClick={() => onSelectPrompt(cmd.text)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-cyan-500/40 text-neutral-200 text-xs font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 group hover:shadow-lg hover:shadow-cyan-500/5 text-left"
            >
              <span className="text-sm">{cmd.icon}</span>
              <div>
                <span className="font-semibold text-white block group-hover:text-cyan-300 transition-colors">
                  "{cmd.text}"
                </span>
                <span className="text-[10px] text-neutral-400">{cmd.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Proactive Event Simulators Section */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-neutral-800/80">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Simulate Proactive Background Events (Observer Triggers Speech)
          </span>
          <span className="text-[10px] text-neutral-400 hidden sm:inline">
            Assistant detects automatically without user speech
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            disabled={disabled}
            onClick={() =>
              onSimulateEvent("NEW_EMAIL", {
                from: "Professor Ramanathan",
                subject: "AI Assignment 3: Transformers",
                deadline: "Tomorrow 11:59 PM",
              })
            }
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-neutral-900/90 hover:bg-amber-950/20 border border-neutral-800 hover:border-amber-500/40 text-left transition-all cursor-pointer disabled:opacity-50"
          >
            <Mail className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-xs font-medium text-neutral-200 block">
                Incoming Assignment Email
              </span>
              <span className="text-[10px] text-neutral-400">Triggers autonomous intake</span>
            </div>
          </button>

          <button
            disabled={disabled}
            onClick={() =>
              onSimulateEvent("CALENDAR_CHANGED", {
                title: "Capstone Project Meeting",
                oldTime: "17:00",
                newTime: "18:00",
              })
            }
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-neutral-900/90 hover:bg-blue-950/20 border border-neutral-800 hover:border-blue-500/40 text-left transition-all cursor-pointer disabled:opacity-50"
          >
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="text-xs font-medium text-neutral-200 block">
                Meeting Rescheduled (5→6 PM)
              </span>
              <span className="text-[10px] text-neutral-400">Recalculates plan dynamically</span>
            </div>
          </button>

          <button
            disabled={disabled}
            onClick={() =>
              onSimulateEvent("DEADLINE_APPROACHING", {
                task: "AI Assignment 3",
                hoursLeft: 22,
                status: "NOT_STARTED",
              })
            }
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-neutral-900/90 hover:bg-rose-950/20 border border-neutral-800 hover:border-rose-500/40 text-left transition-all cursor-pointer disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="text-xs font-medium text-neutral-200 block">
                Forgotten Work Danger Alert
              </span>
              <span className="text-[10px] text-neutral-400">Proactive spoken warning</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
