import React, { useState } from "react";
import {
  GraduationCap,
  Mail,
  Calendar,
  Sparkles,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowRight,
  LogOut,
  Zap,
  Volume2,
} from "lucide-react";
import {
  GoogleUser,
  ClassroomCourse,
  ClassroomCoursework,
  GmailMessageItem,
  CalendarEventItem,
} from "../types";

interface GoogleWorkspacePanelProps {
  user: GoogleUser | null;
  hasActiveToken: boolean;
  isSigningIn: boolean;
  authError: string | null;
  gmailError: string | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onSyncAll: () => Promise<void>;
  courses: ClassroomCourse[];
  coursework: ClassroomCoursework[];
  emails: GmailMessageItem[];
  calendar: CalendarEventItem[];
  isSyncing: boolean;
  onCompleteWork: (cw: ClassroomCoursework) => void;
  onTalkFirst: () => void;
  autoWatcherActive: boolean;
  onToggleAutoWatcher: () => void;
}

export const GoogleWorkspacePanel: React.FC<GoogleWorkspacePanelProps> = ({
  user,
  hasActiveToken,
  isSigningIn,
  authError,
  gmailError,
  onSignIn,
  onSignOut,
  onSyncAll,
  courses,
  coursework,
  emails,
  calendar,
  isSyncing,
  onCompleteWork,
  onTalkFirst,
  autoWatcherActive,
  onToggleAutoWatcher,
}) => {
  const [activeTab, setActiveTab] = useState<"classroom" | "gmail" | "calendar">("gmail");
  const [emailFilter, setEmailFilter] = useState<"all" | "assignments">("all");
  const [emailSearchQuery, setEmailSearchQuery] = useState("");

  const assignmentEmails = emails.filter((e) => e.isAssignmentRelated);
  const displayedEmails = emails.filter((em) => {
    if (emailFilter === "assignments" && !em.isAssignmentRelated) return false;
    if (emailSearchQuery.trim()) {
      const q = emailSearchQuery.toLowerCase();
      return (
        em.subject.toLowerCase().includes(q) ||
        em.from.toLowerCase().includes(q) ||
        em.snippet.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Fallback demo coursework if real classroom is empty or syncing for the first time
  const displayCoursework: ClassroomCoursework[] =
    coursework.length > 0
      ? coursework
      : [
          {
            id: "demo_cw_1",
            courseId: "c_ai",
            courseName: "CS401: Deep Learning & Transformers",
            title: "Assignment 3: Attention Mechanism & Multi-Head Self Attention",
            description: "Implement scaled dot-product attention from scratch in PyTorch. Include derivations for gradient backward pass.",
            dueDate: { year: 2026, month: 9, day: 16 },
            dueTime: { hours: 23, minutes: 59 },
            maxPoints: 25,
            priorityScore: 0.92,
          },
          {
            id: "demo_cw_2",
            courseId: "c_emb",
            courseName: "EE302: Embedded Systems",
            title: "Lab 2: Timer Prescalers & UART Ring Buffer",
            description: "Configure NVIC interrupt priority registers and calculate register values for 115200 baud rate at 16MHz clock.",
            dueDate: { year: 2026, month: 9, day: 18 },
            dueTime: { hours: 17, minutes: 0 },
            maxPoints: 20,
            priorityScore: 0.85,
          },
        ];

  return (
    <div
      id="google-workspace-panel"
      className="w-full max-w-4xl mx-auto px-4 mt-6"
    >
      <div className="rounded-2xl bg-neutral-900/95 border border-neutral-800 p-5 shadow-2xl backdrop-blur-md">
        {/* Top Header: Account & Talk First */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Google Workspace & Classroom Live Sync
                </h3>
                {hasActiveToken ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE OAUTH CONNECTED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    SIGN-IN REQUIRED FOR GMAIL
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400">
                Target account: <span className="text-neutral-200 font-medium">{user?.email || "rangasmyakash@gmail.com"}</span>
                {hasActiveToken && <span className="text-emerald-400 ml-2 font-mono text-[11px]">(Token Active)</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Talk First Button */}
            <button
              id="talk-first-button"
              onClick={onTalkFirst}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
              title="LifeOS will speak first to update you on coursework"
            >
              <Volume2 className="w-4 h-4 text-white" />
              <span>Talk First</span>
            </button>

            {/* Sync Now */}
            <button
              type="button"
              id="sync-workspace-btn"
              onClick={onSyncAll}
              disabled={isSyncing || isSigningIn}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-cyan-400" : ""}`} />
              <span>{isSyncing ? "Fetching..." : "Sync Now"}</span>
            </button>

            {/* Google Sign In / Out */}
            {!hasActiveToken ? (
              <button
                type="button"
                id="google-signin-btn"
                onClick={onSignIn}
                disabled={isSigningIn}
                className="gsi-material-button flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 text-xs font-semibold shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-95 disabled:opacity-60"
                title="Connect Gmail & Google Classroom"
              >
                {isSigningIn ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-800" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer text-xs"
                title="Disconnect Google session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            )}
          </div>
        </div>

        {/* Auth or Gmail Error Banner */}
        {(authError || gmailError) && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="font-semibold text-rose-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                Connection Notice:
              </span>
              <p className="text-neutral-300 leading-relaxed">
                {authError || gmailError}
              </p>
            </div>
            <button
              onClick={onSignIn}
              className="shrink-0 px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-medium text-xs border border-rose-500/30 transition-colors cursor-pointer"
            >
              Sign In Now
            </button>
          </div>
        )}

        {/* Autonomous Watcher Switch */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 px-3 my-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80 text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-neutral-200 font-medium">Autonomous Trigger Watcher:</span>
            <span className="text-neutral-400 text-[11px]">
              Automatically polls Gmail & Classroom every 30s. When new work arrives, LifeOS speaks immediately and prepares solutions.
            </span>
          </div>

          <button
            onClick={onToggleAutoWatcher}
            className={`px-3 py-1 rounded-lg font-mono text-[11px] font-semibold transition-colors cursor-pointer ${
              autoWatcherActive
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-neutral-800 text-neutral-400 border border-neutral-700"
            }`}
          >
            {autoWatcherActive ? "ACTIVE (30s POLL)" : "PAUSED"}
          </button>
        </div>

        {/* Source Navigation Tabs */}
        <div className="flex items-center gap-2 mb-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab("gmail")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "gmail"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold"
                : "text-neutral-400 hover:bg-neutral-800"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Gmail Inbox ({emails.length})</span>
            {assignmentEmails.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                {assignmentEmails.length} new
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("classroom")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "classroom"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold"
                : "text-neutral-400 hover:bg-neutral-800"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Google Classroom ({displayCoursework.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "calendar"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold"
                : "text-neutral-400 hover:bg-neutral-800"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar Schedule ({calendar.length})</span>
          </button>
        </div>

        {/* TAB 1: GMAIL INBOX & COURSEWORK EMAILS */}
        {activeTab === "gmail" && (
          <div className="space-y-3">
            {!hasActiveToken ? (
              /* Hero Call to Action to Sign in with Google */
              <div className="p-6 rounded-xl bg-neutral-950/80 border border-blue-500/20 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="text-sm font-semibold text-white">
                    Connect Gmail to Fetch Coursework & Emails
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    LifeOS needs your permission to read incoming emails from <span className="text-neutral-200 font-medium">{user?.email || "rangasmyakash@gmail.com"}</span>. Once signed in, LifeOS automatically extracts assignments, calculates deadlines, and solves questions for you.
                  </p>
                </div>
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={onSignIn}
                    disabled={isSigningIn}
                    className="gsi-material-button flex items-center gap-2.5 px-5 py-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 text-xs font-semibold shadow-lg transition-all cursor-pointer hover:shadow-xl active:scale-95 disabled:opacity-60"
                  >
                    {isSigningIn ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-neutral-800" />
                        <span>Opening Google Sign-In...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 48 48">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        </svg>
                        <span>Sign in with Google to Read Mail</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Search & Filter Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEmailFilter("all")}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        emailFilter === "all"
                          ? "bg-neutral-800 text-white font-medium"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      All Inbox Emails ({emails.length})
                    </button>
                    <button
                      onClick={() => setEmailFilter("assignments")}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                        emailFilter === "assignments"
                          ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Assignments Detected ({assignmentEmails.length})</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Search mail subject, sender..."
                      value={emailSearchQuery}
                      onChange={(e) => setEmailSearchQuery(e.target.value)}
                      className="px-3 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:border-cyan-500 w-48"
                    />
                    <button
                      onClick={onSyncAll}
                      disabled={isSyncing}
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1 cursor-pointer"
                      title="Refresh Gmail"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {/* Email List */}
                <div className="space-y-2">
                  {displayedEmails.length === 0 ? (
                    <div className="p-8 text-center text-xs text-neutral-500 bg-neutral-950/40 rounded-xl border border-neutral-800/60 space-y-2">
                      <p>No messages match your current filter.</p>
                      <button
                        onClick={onSyncAll}
                        className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Fetch latest emails now
                      </button>
                    </div>
                  ) : (
                    displayedEmails.map((em) => (
                      <div
                        key={em.id}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group ${
                          em.isAssignmentRelated
                            ? "bg-amber-950/10 border-amber-500/30 hover:border-amber-500/50"
                            : "bg-neutral-950 border-neutral-800/80 hover:border-neutral-700"
                        }`}
                      >
                        <div className="space-y-1 max-w-xl">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-xs group-hover:text-cyan-200 transition-colors">
                              {em.subject}
                            </span>
                            {em.isAssignmentRelated && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-semibold flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                ASSIGNMENT DETECTED
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-neutral-400 block font-mono">
                            {em.from}
                          </span>
                          <p className="text-xs text-neutral-500 line-clamp-1">
                            {em.snippet}
                          </p>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0">
                          <span className="text-[10px] text-neutral-500 font-mono">
                            {em.date ? new Date(em.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""}
                          </span>
                          <button
                            onClick={() => {
                              const cwFromEmail: ClassroomCoursework = {
                                id: `mail_${em.id}`,
                                courseId: "gmail",
                                courseName: em.from.replace(/<.*>/, "").trim() || "Course Email",
                                title: em.subject,
                                description: em.snippet,
                                maxPoints: 25,
                              };
                              onCompleteWork(cwFromEmail);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-[11px] font-semibold shadow transition-all cursor-pointer shrink-0"
                          >
                            <Sparkles className="w-3 h-3 text-cyan-200" />
                            <span>Solve with LifeOS</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: GOOGLE CLASSROOM */}
        {activeTab === "classroom" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Active Coursework Assignments</span>
              <span className="text-[11px] text-cyan-400">
                Click "Complete the Work" to generate derivations, solver code & report
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {displayCoursework.map((cw) => {
                const dueDateStr = cw.dueDate
                  ? `${cw.dueDate.year}-${String(cw.dueDate.month).padStart(2, "0")}-${String(
                      cw.dueDate.day
                    ).padStart(2, "0")}`
                  : "Tomorrow 11:59 PM";

                return (
                  <div
                    key={cw.id}
                    className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          {cw.courseName || "Course"}
                        </span>
                        {cw.maxPoints && (
                          <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {cw.maxPoints} MARKS
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-semibold text-white group-hover:text-cyan-200 transition-colors">
                        {cw.title}
                      </h4>

                      <p className="text-xs text-neutral-400 line-clamp-2 max-w-xl">
                        {cw.description || "Coursework submission required"}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-neutral-500 pt-1 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          Due: {dueDateStr}
                        </span>
                        {cw.alternateLink && (
                          <a
                            href={cw.alternateLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-neutral-400 hover:text-cyan-300 underline"
                          >
                            Classroom Link <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Action button */}
                    <button
                      id={`solve-btn-${cw.id}`}
                      onClick={() => onCompleteWork(cw)}
                      className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-cyan-200" />
                      <span>Complete the Work</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: CALENDAR SCHEDULE */}
        {activeTab === "calendar" && (
          <div className="space-y-2">
            {calendar.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-500">
                No meetings scheduled for today on Google Calendar. Focus blocks are fully available for coursework!
              </div>
            ) : (
              calendar.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white">{ev.summary}</span>
                    <span className="text-[11px] text-neutral-400 block font-mono">
                      {ev.start ? new Date(ev.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "10:00"} –{" "}
                      {ev.end ? new Date(ev.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "11:00"}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                    SCHEDULED
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
