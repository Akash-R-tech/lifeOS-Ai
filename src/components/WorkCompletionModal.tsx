import React, { useState } from "react";
import {
  X,
  Sparkles,
  Code2,
  FileText,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  Download,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { WorkCompletionData } from "../types";

interface WorkCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WorkCompletionData | null;
  onSpeakSummary?: (text: string) => void;
}

export const WorkCompletionModal: React.FC<WorkCompletionModalProps> = ({
  isOpen,
  onClose,
  data,
  onSpeakSummary,
}) => {
  const [activeTab, setActiveTab] = useState<"solution" | "code" | "files" | "schedule">("solution");
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);

  if (!isOpen || !data) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(id);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div
      id="work-completion-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="w-full max-w-4xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                  {data.courseName || "Google Classroom"}
                </span>
                <span className="text-xs text-neutral-400 font-mono">Autonomous Solver</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">{data.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSpeakSummary && (
              <button
                onClick={() => onSpeakSummary(data.summary)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-cyan-300 transition-colors cursor-pointer"
                title="Hear LifeOS verbal explanation"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hear Explanation</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Executive Summary Banner */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-cyan-950/30 via-neutral-900 to-blue-950/30 border-b border-neutral-800/80">
          <div className="flex items-start gap-3">
            <span className="text-xl">🎙️</span>
            <div>
              <p className="text-sm text-neutral-200 leading-relaxed font-medium">
                "{data.summary}"
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.breakdown.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11px] text-neutral-300 bg-neutral-800/80 px-2.5 py-1 rounded-md border border-neutral-700/60 font-mono"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 px-6 pt-2 gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab("solution")}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === "solution"
                ? "border-cyan-400 text-cyan-300 bg-neutral-900/60"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Step-by-Step Solution</span>
          </button>

          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === "code"
                ? "border-cyan-400 text-cyan-300 bg-neutral-900/60"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Solver Code</span>
          </button>

          <button
            onClick={() => setActiveTab("files")}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === "files"
                ? "border-cyan-400 text-cyan-300 bg-neutral-900/60"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Workspace Files ({data.workspaceFiles?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === "schedule"
                ? "border-cyan-400 text-cyan-300 bg-neutral-900/60"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Study & Submit Schedule</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-sm text-neutral-300">
          {activeTab === "solution" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
                <div className="prose prose-invert max-w-none text-neutral-200 leading-relaxed font-sans text-sm whitespace-pre-wrap">
                  {data.stepByStepSolution}
                </div>
              </div>
            </div>
          )}

          {activeTab === "code" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-mono">
                  python / typescript · Verified clean syntax
                </span>
                <button
                  onClick={() => handleCopy(data.codeSnippet || "", "code")}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 transition-colors cursor-pointer"
                >
                  {copiedFile === "code" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed">
                <code>{data.codeSnippet || "# No code provided"}</code>
              </pre>
            </div>
          )}

          {activeTab === "files" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* File List */}
              <div className="space-y-1.5 md:border-r md:border-neutral-800 md:pr-4">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                  Staged Files
                </span>
                {data.workspaceFiles.map((file, idx) => (
                  <button
                    key={file.name}
                    onClick={() => setActiveFileIndex(idx)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-2 ${
                      activeFileIndex === idx
                        ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
                        : "text-neutral-400 hover:bg-neutral-800/80 hover:text-neutral-200"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="truncate">{file.name}</span>
                  </button>
                ))}
              </div>

              {/* Active File Content */}
              <div className="md:col-span-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-300 font-semibold">
                    {data.workspaceFiles[activeFileIndex]?.name}
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(
                        data.workspaceFiles[activeFileIndex]?.content || "",
                        data.workspaceFiles[activeFileIndex]?.name || "file"
                      )
                    }
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 transition-colors cursor-pointer"
                  >
                    {copiedFile === data.workspaceFiles[activeFileIndex]?.name ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Copy Content</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300 overflow-x-auto max-h-[350px] whitespace-pre-wrap leading-relaxed">
                  {data.workspaceFiles[activeFileIndex]?.content}
                </pre>
              </div>
            </div>
          )}

          {activeTab === "schedule" && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-400">
                LifeOS analyzed your Google Calendar meetings and allocated protected focus blocks so you complete this work without stress.
              </p>
              <div className="space-y-2">
                {data.recommendedSchedule.map((slot, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/70 border border-neutral-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          {slot.task}
                        </span>
                        <span className="text-[11px] text-cyan-400 font-mono">
                          Target Focus Time: {slot.start} – {slot.end}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      CALENDAR SLOT RESERVED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            Assigned to <span className="text-neutral-300 font-medium">Akash R (rangasmyakash@gmail.com)</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20 transition-colors cursor-pointer"
            >
              Done / Back to Voice OS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
