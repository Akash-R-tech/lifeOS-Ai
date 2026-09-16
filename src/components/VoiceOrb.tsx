import React from "react";
import { motion } from "motion/react";
import { Mic, MicOff, Volume2, ShieldAlert, Cpu, Sparkles, CheckCircle2 } from "lucide-react";
import { VoiceState } from "../types";

interface VoiceOrbProps {
  state: VoiceState;
  isListening: boolean;
  onToggleListen: () => void;
  audioLevel?: number;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  state,
  isListening,
  onToggleListen,
}) => {
  // State specific color themes and descriptions
  const getTheme = () => {
    switch (state) {
      case "LISTENING":
        return {
          glow: "from-emerald-500/40 via-teal-500/30 to-cyan-500/20",
          ring: "border-emerald-400/60 shadow-[0_0_50px_rgba(16,185,129,0.3)]",
          core: "bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400",
          label: "Listening to voice...",
          sublabel: "Say 'Mapla, enna pending?' or speak freely"
        };
      case "REASONING":
        return {
          glow: "from-amber-500/40 via-orange-500/30 to-yellow-500/20",
          ring: "border-amber-400/60 shadow-[0_0_50px_rgba(245,158,11,0.3)]",
          core: "bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400",
          label: "Analyzing Context & Priorities...",
          sublabel: "Calculating deterministic weights & memory"
        };
      case "ACTING":
        return {
          glow: "from-cyan-500/40 via-blue-500/30 to-indigo-500/20",
          ring: "border-cyan-400/60 shadow-[0_0_50px_rgba(6,182,212,0.3)]",
          core: "bg-gradient-to-tr from-cyan-600 via-blue-500 to-indigo-400",
          label: "Autonomous Computer Agent Acting...",
          sublabel: "Preparing workspace & verifying changes"
        };
      case "SPEAKING":
        return {
          glow: "from-purple-500/40 via-fuchsia-500/30 to-pink-500/20",
          ring: "border-fuchsia-400/60 shadow-[0_0_50px_rgba(217,70,239,0.3)]",
          core: "bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-pink-400",
          label: "LifeOS Speaking...",
          sublabel: "Voice intimation active"
        };
      case "EMERGENCY_STOP":
        return {
          glow: "from-rose-600/50 via-red-600/30 to-amber-600/20",
          ring: "border-rose-500/80 shadow-[0_0_60px_rgba(244,63,94,0.4)]",
          core: "bg-gradient-to-tr from-red-700 via-rose-600 to-red-500",
          label: "SYSTEM ACTIONS FROZEN",
          sublabel: "Emergency kill-switch is active"
        };
      case "IDLE":
      default:
        return {
          glow: "from-blue-600/20 via-cyan-600/10 to-transparent",
          ring: "border-neutral-700/50 shadow-[0_0_30px_rgba(59,130,246,0.1)]",
          core: "bg-gradient-to-tr from-neutral-800 via-neutral-900 to-neutral-800",
          label: "LifeOS Ready",
          sublabel: "Click orb or speak to begin"
        };
    }
  };

  const theme = getTheme();

  return (
    <div id="voice-orb-container" className="flex flex-col items-center justify-center relative py-6">
      {/* Outer ambient glow halo */}
      <motion.div
        className={`absolute w-72 h-72 rounded-full bg-radial ${theme.glow} blur-3xl pointer-events-none`}
        animate={{
          scale: state === "LISTENING" || state === "SPEAKING" ? [1, 1.25, 1] : [1, 1.05, 1],
          opacity: state === "IDLE" ? 0.3 : 0.8,
        }}
        transition={{
          repeat: Infinity,
          duration: state === "LISTENING" ? 1.8 : 3,
          ease: "easeInOut",
        }}
      />

      {/* Orbiting Frequency Rings */}
      <motion.div
        className={`absolute w-64 h-64 rounded-full border border-dashed ${
          state === "EMERGENCY_STOP" ? "border-rose-500/40" : "border-cyan-500/20"
        }`}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
      />
      <motion.div
        className="absolute w-52 h-52 rounded-full border border-neutral-800/80"
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
      />

      {/* Interactive Main Orb Button */}
      <motion.button
        id="voice-orb-button"
        onClick={onToggleListen}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className={`relative z-10 w-44 h-44 rounded-full flex flex-col items-center justify-center p-4 border ${theme.ring} cursor-pointer transition-all duration-300 backdrop-blur-md overflow-hidden group focus:outline-none`}
      >
        {/* Shimmering core gradient */}
        <div className={`absolute inset-0 opacity-85 ${theme.core} transition-colors duration-500`} />

        {/* Dynamic inner audio wave ripple */}
        {(state === "LISTENING" || state === "SPEAKING") && (
          <motion.div
            className="absolute inset-0 bg-white/20 rounded-full"
            animate={{
              scale: [0.8, 1.3, 0.8],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.4,
              ease: "easeOut",
            }}
          />
        )}

        {/* Center icon */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 text-white">
          {state === "EMERGENCY_STOP" ? (
            <ShieldAlert className="w-10 h-10 text-white animate-pulse" />
          ) : state === "SPEAKING" ? (
            <Volume2 className="w-10 h-10 text-white animate-bounce" />
          ) : state === "REASONING" ? (
            <Cpu className="w-10 h-10 text-white animate-spin" />
          ) : state === "ACTING" ? (
            <CheckCircle2 className="w-10 h-10 text-white" />
          ) : isListening ? (
            <Mic className="w-10 h-10 text-white animate-pulse" />
          ) : (
            <Mic className="w-9 h-9 text-neutral-200 group-hover:text-white transition-colors" />
          )}

          <span className="text-[11px] font-semibold tracking-wider uppercase drop-shadow">
            {state === "EMERGENCY_STOP" ? "FROZEN" : isListening ? "LISTENING" : "TAP TO TALK"}
          </span>
        </div>
      </motion.button>

      {/* State Text Readout */}
      <div className="mt-5 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs font-medium text-neutral-200 shadow-sm">
          <span
            className={`w-2 h-2 rounded-full ${
              state === "EMERGENCY_STOP"
                ? "bg-rose-500 animate-ping"
                : state === "LISTENING"
                ? "bg-emerald-400 animate-ping"
                : state === "SPEAKING"
                ? "bg-fuchsia-400 animate-pulse"
                : state === "REASONING"
                ? "bg-amber-400 animate-spin"
                : "bg-cyan-500"
            }`}
          />
          <span>{theme.label}</span>
        </div>
        <p className="text-xs text-neutral-400 mt-1.5 max-w-sm">{theme.sublabel}</p>
      </div>
    </div>
  );
};
