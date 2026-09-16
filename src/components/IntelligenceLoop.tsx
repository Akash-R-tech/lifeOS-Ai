import React from "react";
import { motion } from "motion/react";
import { Activity, Check, ArrowRight } from "lucide-react";
import { VoiceState } from "../types";

interface IntelligenceLoopProps {
  currentStage: number; // 0 to 10
  voiceState: VoiceState;
  lastTrigger?: string;
}

const STAGES = [
  { name: "Detect Change", desc: "Monitored Gmail/Calendar/Files" },
  { name: "Understand Context", desc: "Goals, Deadlines, Workload" },
  { name: "Check Memory", desc: "Vector & Relational Context" },
  { name: "Decide Importance", desc: "Urgency, Impact & Threshold" },
  { name: "Decide Action", desc: "Priority Engine & Daily Planner" },
  { name: "Check Permission", desc: "Capability Policy Guard" },
  { name: "Execute Action", desc: "Sandboxed Computer Executor" },
  { name: "Verify Result", desc: "Post-execution Confirmation" },
  { name: "Update Memory", desc: "Episodic State Saved" },
  { name: "Voice Intimation", desc: "Proactive Speech Synthesized" },
];

export const IntelligenceLoop: React.FC<IntelligenceLoopProps> = ({
  currentStage,
  voiceState,
  lastTrigger,
}) => {
  return (
    <div id="intelligence-loop" className="w-full max-w-4xl mx-auto mt-4 px-4">
      <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md p-3.5">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-semibold text-neutral-200 uppercase tracking-wider text-[11px]">
              Autonomous Intelligence Loop
            </span>
          </div>
          {lastTrigger && (
            <span className="text-[11px] text-neutral-400 font-mono">
              Trigger: <span className="text-cyan-300">{lastTrigger}</span>
            </span>
          )}
        </div>

        {/* 10-step Pipeline Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5">
          {STAGES.map((st, idx) => {
            const isCompleted = idx < currentStage;
            const isActive = idx === currentStage;
            return (
              <div
                key={st.name}
                className={`relative flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all duration-300 ${
                  isActive
                    ? "bg-cyan-500/20 border-cyan-400/80 text-cyan-200 shadow-md shadow-cyan-500/20"
                    : isCompleted
                    ? "bg-neutral-950/80 border-neutral-700/60 text-neutral-300"
                    : "bg-neutral-950/30 border-neutral-800/40 text-neutral-600"
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                  {isCompleted && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                </div>
                <span className="text-[10px] font-medium tracking-tight mt-0.5 leading-tight line-clamp-1">
                  {st.name}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute -bottom-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
