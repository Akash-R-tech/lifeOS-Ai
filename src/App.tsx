import React, { useState, useEffect, useRef, useCallback } from "react";
import { VoiceOrb } from "./components/VoiceOrb";
import { StatusHeader } from "./components/StatusHeader";
import { IntelligenceLoop } from "./components/IntelligenceLoop";
import { DemoPrompts } from "./components/DemoPrompts";
import { ActionLogModal } from "./components/ActionLogModal";
import { PermissionModal } from "./components/PermissionModal";
import { GoogleWorkspacePanel } from "./components/GoogleWorkspacePanel";
import { WorkCompletionModal } from "./components/WorkCompletionModal";
import {
  VoiceState,
  ActionLog,
  SystemHealth,
  GoogleUser,
  ClassroomCourse,
  ClassroomCoursework,
  GmailMessageItem,
  CalendarEventItem,
  WorkCompletionData,
} from "./types";
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  setAccessToken,
} from "./services/googleAuth";
import {
  fetchGmailMessages,
  fetchClassroomCourses,
  fetchClassroomCoursework,
  fetchGoogleCalendarEvents,
} from "./services/googleDataService";
import { Mic, Send, Volume2, Sparkles, AlertCircle, Clock, CheckCircle2, GraduationCap } from "lucide-react";

export default function App() {
  const [voiceState, setVoiceState] = useState<VoiceState>("IDLE");
  const [isListening, setIsListening] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [transcript, setTranscript] = useState<string>("Click the orb or say 'Mapla, enna pending?'");
  const [assistantSpokenText, setAssistantSpokenText] = useState<string>(
    "Mapla Akash, LifeOS is active. Google Classroom and Gmail are connected and monitored."
  );
  const [lastTrigger, setLastTrigger] = useState<string>("SYSTEM_BOOT");
  const [currentStep, setCurrentStep] = useState<number>(9); // 0-9
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [emergencyStop, setEmergencyStop] = useState(false);
  const [voiceAudioEnabled, setVoiceAudioEnabled] = useState(true);
  const [grantedCapabilities, setGrantedCapabilities] = useState<string[]>([]);
  
  // Google Workspace & Classroom State
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>({
    email: "rangasmyakash@gmail.com",
    displayName: "Akash R",
    photoURL: null,
    uid: "user_akash_default",
  });
  const [hasActiveToken, setHasActiveToken] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [gmailError, setGmailError] = useState<string | null>(null);
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [coursework, setCoursework] = useState<ClassroomCoursework[]>([]);
  const [emails, setEmails] = useState<GmailMessageItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoWatcherActive, setAutoWatcherActive] = useState(true);
  
  // Work Completion Modal State
  const [selectedSolution, setSelectedSolution] = useState<WorkCompletionData | null>(null);
  const [showSolutionModal, setShowSolutionModal] = useState(false);

  // Modals
  const [showActionLogs, setShowActionLogs] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);

  // Web Speech Recognition Ref
  const recognitionRef = useRef<any>(null);

  // Initialize Auth & Speech
  useEffect(() => {
    fetchHealth();
    fetchActionHistory();
    fetchPermissions();

    // Firebase Auth listener
    const unsubscribeAuth = initAuth(
      (user, token) => {
        setGoogleUser({
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          uid: user.uid,
        });
        setAccessToken(token);
        setHasActiveToken(true);
        setAuthError(null);
        // Automatically fetch data upon recognized session
        syncGoogleData(token, user.email || "rangasmyakash@gmail.com", user.displayName || "Akash R");
      },
      () => {
        // No active token in memory
        setHasActiveToken(false);
        setGoogleUser({
          email: "rangasmyakash@gmail.com",
          displayName: "Akash R",
          photoURL: null,
          uid: "user_akash_default",
        });
      }
    );

    // Setup Web Speech Recognition if available
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = "en-US";

      recog.onstart = () => {
        setIsListening(true);
        setVoiceState("LISTENING");
      };

      recog.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setTranscript(`"${spoken}"`);
        setIsListening(false);
        handleVoiceCommand(spoken);
      };

      recog.onerror = (err: any) => {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
        setVoiceState("IDLE");
      };

      recog.onend = () => {
        setIsListening(false);
        if (voiceState === "LISTENING") {
          setVoiceState("IDLE");
        }
      };

      recognitionRef.current = recog;
    }

    // Connect to Server-Sent Events (SSE) for Autonomous Proactive Voice
    const eventSource = new EventSource("/api/events/stream");
    eventSource.addEventListener("proactive_voice", (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.speech) {
          triggerProactiveSpeech(payload.speech, payload.event?.eventType || "AUTONOMOUS_EVENT");
        }
      } catch (err) {
        console.error("Failed to parse SSE proactive voice:", err);
      }
    });

    return () => {
      unsubscribeAuth();
      eventSource.close();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Autonomous Watcher Loop: Every 30s checks for updates
  useEffect(() => {
    if (!autoWatcherActive) return;

    const interval = setInterval(() => {
      const token = getAccessToken();
      if (token) {
        syncGoogleData(token, googleUser?.email || "rangasmyakash@gmail.com", googleUser?.displayName || "Akash R");
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoWatcherActive, googleUser]);

  const fetchHealth = async () => {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealth(data);
    } catch (e) {
      console.warn("Health check error:", e);
    }
  };

  const fetchActionHistory = async () => {
    try {
      const res = await fetch("/api/actions/history");
      const data = await res.json();
      setActionLogs(data);
    } catch (e) {
      console.warn("Action history error:", e);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await fetch("/api/permissions");
      const data = await res.json();
      setGrantedCapabilities(data.grantedCapabilities || []);
      setEmergencyStop(data.emergencyStopActive || false);
    } catch (e) {
      console.warn("Permissions fetch error:", e);
    }
  };

  // Speaks aloud using Web Speech Synthesis API
  const speakText = (text: string) => {
    if (!voiceAudioEnabled || !("speechSynthesis" in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Natural") ||
          v.name.includes("Google") ||
          v.name.includes("Samantha") ||
          v.name.includes("Daniel"))
    );
    if (preferred) {
      utterance.voice = preferred;
    }

    utterance.onstart = () => {
      setVoiceState("SPEAKING");
    };

    utterance.onend = () => {
      setVoiceState("IDLE");
    };

    utterance.onerror = () => {
      setVoiceState("IDLE");
    };

    window.speechSynthesis.speak(utterance);
  };

  // Run intelligence cycle animation across 10 stages
  const runIntelligenceLoopAnimation = async (triggerName: string) => {
    setLastTrigger(triggerName);
    for (let i = 0; i <= 9; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, 90));
    }
  };

  // Triggered by SSE or Proactive Simulator
  const triggerProactiveSpeech = async (speech: string, eventType: string) => {
    setVoiceState("ACTING");
    await runIntelligenceLoopAnimation(`PROACTIVE_${eventType}`);
    setAssistantSpokenText(speech);
    speakText(speech);
    fetchActionHistory();
  };

  // "Talk First": Speaks initial status briefing immediately
  const handleTalkFirst = async () => {
    try {
      const res = await fetch("/api/voice/greeting");
      const data = await res.json();
      const greeting =
        data.speech ||
        "Mapla Akash, LifeOS is online. I'm connected to your Gmail and Google Classroom. How can I help you complete your coursework today?";
      setAssistantSpokenText(greeting);
      speakText(greeting);
    } catch (e) {
      const fallback = "Mapla Akash, LifeOS is online and monitoring your coursework.";
      setAssistantSpokenText(fallback);
      speakText(fallback);
    }
  };

  // Sync Google Workspace & Classroom Data
  const syncGoogleData = async (token: string, userEmail: string, userName: string) => {
    setIsSyncing(true);
    setGmailError(null);
    try {
      const [gmailResult, fetchedCourses] = await Promise.all([
        fetchGmailMessages(token),
        fetchClassroomCourses(token),
      ]);

      const fetchedEmails = gmailResult.messages;
      if (gmailResult.error) {
        setGmailError(gmailResult.error);
      }

      const fetchedCoursework =
        fetchedCourses.length > 0
          ? await fetchClassroomCoursework(token, fetchedCourses)
          : [];

      const fetchedCalendar = await fetchGoogleCalendarEvents(token);

      setEmails(fetchedEmails);
      setCourses(fetchedCourses);
      setCoursework(fetchedCoursework);
      setCalendarEvents(fetchedCalendar);

      // Ingest to backend
      const res = await fetch("/api/sync/workspace-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: fetchedEmails,
          courses: fetchedCourses,
          coursework: fetchedCoursework,
          calendar: fetchedCalendar,
          userEmail,
          userName,
        }),
      });

      const data = await res.json();
      if (data.proactiveSpeech) {
        setAssistantSpokenText(data.proactiveSpeech);
        speakText(data.proactiveSpeech);
      }
      fetchActionHistory();
    } catch (err: any) {
      console.warn("syncGoogleData failed:", err);
      setGmailError(err?.message || "Failed to fetch data from Gmail or Google Classroom.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Sign In with Google
  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    setAuthError(null);
    setGmailError(null);
    try {
      const authResult = await googleSignIn();
      if (authResult) {
        setGoogleUser({
          email: authResult.user.email,
          displayName: authResult.user.displayName,
          photoURL: authResult.user.photoURL,
          uid: authResult.user.uid,
        });
        setAccessToken(authResult.accessToken);
        setHasActiveToken(true);
        await syncGoogleData(
          authResult.accessToken,
          authResult.user.email || "rangasmyakash@gmail.com",
          authResult.user.displayName || "Akash R"
        );
      }
    } catch (err: any) {
      if (
        err?.code !== "auth/cancelled-popup-request" &&
        err?.code !== "auth/popup-closed-by-user" &&
        !err?.message?.includes("cancelled-popup-request")
      ) {
        console.warn("Sign in notice:", err);
        setAuthError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setAccessToken(null);
    setHasActiveToken(false);
    setGoogleUser(null);
    setCourses([]);
    setCoursework([]);
    setEmails([]);
    setCalendarEvents([]);
    setAuthError(null);
    setGmailError(null);
  };

  // Triggered when user clicks "Complete the Work" or says voice command
  const handleCompleteWork = async (cw: ClassroomCoursework) => {
    setVoiceState("REASONING");
    await runIntelligenceLoopAnimation("AUTONOMOUS_WORK_SOLVER");

    try {
      const res = await fetch("/api/assignment/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseworkId: cw.id,
          title: cw.title,
          description: cw.description,
          courseName: cw.courseName,
        }),
      });

      const result = await res.json();
      if (result.success && result.data) {
        setSelectedSolution(result.data);
        setShowSolutionModal(true);
        if (result.speech) {
          setAssistantSpokenText(result.speech);
          speakText(result.speech);
        }
      }
      fetchActionHistory();
    } catch (err) {
      console.error("Failed to solve assignment:", err);
      const errMsg = "Mapla, I had an issue running the solution engine. Check server logs.";
      setAssistantSpokenText(errMsg);
      speakText(errMsg);
    } finally {
      setVoiceState("IDLE");
    }
  };

  // Core Voice Command Processing
  const handleVoiceCommand = async (command: string) => {
    if (!command.trim()) return;

    if (emergencyStop) {
      const msg = "SYSTEM BLOCKED: Emergency stop is active. Autonomous actions are frozen.";
      setAssistantSpokenText(msg);
      speakText(msg);
      setVoiceState("EMERGENCY_STOP");
      return;
    }

    setTranscript(`"${command}"`);
    setVoiceState("REASONING");
    await runIntelligenceLoopAnimation("USER_VOICE_COMMAND");

    try {
      const res = await fetch("/api/voice/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: command }),
      });
      const data = await res.json();

      setAssistantSpokenText(data.speech || "Command acknowledged.");
      speakText(data.speech);

      // If user asked to complete/handle the assignment, launch solver
      if (data.intent === "COMPLETE_WORK_ASSIGNMENT" || data.intent === "HANDLE_ASSIGNMENT") {
        const targetCw = coursework[0] || {
          id: "cw_ai_assign",
          courseId: "c_ai",
          courseName: "CS401: Deep Learning",
          title: "AI Assignment 3: Transformers",
          description: "Multi-head attention implementation and gradient backpropagation.",
          maxPoints: 25,
        };
        handleCompleteWork(targetCw);
      }

      fetchActionHistory();
    } catch (e) {
      const errMsg = "Mapla, I had an issue connecting to the reasoning engine.";
      setAssistantSpokenText(errMsg);
      speakText(errMsg);
      setVoiceState("IDLE");
    }
  };

  // Toggle Microphone
  const toggleListening = () => {
    if (emergencyStop) {
      setVoiceState("EMERGENCY_STOP");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setVoiceState("IDLE");
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        setIsListening(true);
        setVoiceState("LISTENING");
        setTimeout(() => {
          setIsListening(false);
          handleVoiceCommand("Mapla, enna pending?");
        }, 1500);
      }
    }
  };

  // Simulate Proactive Events
  const handleSimulateEvent = async (eventType: string, data?: any) => {
    setVoiceState("ACTING");
    await runIntelligenceLoopAnimation(`EVENT_${eventType}`);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType, data }),
      });
      const resData = await res.json();
      if (resData.proactiveVoice) {
        setAssistantSpokenText(resData.proactiveVoice);
        speakText(resData.proactiveVoice);
      }
      fetchActionHistory();
    } catch (e) {
      console.warn("Simulate event error:", e);
      setVoiceState("IDLE");
    }
  };

  // Toggle Emergency Stop
  const handleToggleEmergencyStop = async () => {
    const nextState = !emergencyStop;
    setEmergencyStop(nextState);
    setVoiceState(nextState ? "EMERGENCY_STOP" : "IDLE");

    if (nextState && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {
      await fetch("/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emergencyStop: nextState }),
      });
      fetchActionHistory();
    } catch (e) {
      console.warn("Emergency stop error:", e);
    }
  };

  // Toggle Capability
  const handleToggleCapability = async (capId: string) => {
    const isCurrentlyGranted = grantedCapabilities.includes(capId);
    const updated = isCurrentlyGranted
      ? grantedCapabilities.filter((c) => c !== capId)
      : [...grantedCapabilities, capId];

    setGrantedCapabilities(updated);

    try {
      await fetch("/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant: !isCurrentlyGranted ? capId : undefined,
          revoke: isCurrentlyGranted ? capId : undefined,
        }),
      });
    } catch (e) {
      console.warn("Toggle capability error:", e);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    const text = userInput.trim();
    setUserInput("");
    handleVoiceCommand(text);
  };

  return (
    <div
      id="lifeos-app"
      className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200"
    >
      {/* Status Header */}
      <StatusHeader
        health={health}
        emergencyStop={emergencyStop}
        onToggleEmergencyStop={handleToggleEmergencyStop}
        voiceAudioEnabled={voiceAudioEnabled}
        onToggleVoiceAudio={() => setVoiceAudioEnabled(!voiceAudioEnabled)}
        onOpenActionLogs={() => setShowActionLogs(true)}
        onOpenPermissions={() => setShowPermissions(true)}
        unverifiedActionsCount={actionLogs.filter((a) => !a.verified).length}
      />

      {/* Main Voice Hub Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-5xl mx-auto w-full">
        {/* Central Reactive Voice Orb */}
        <VoiceOrb
          state={voiceState}
          isListening={isListening}
          onToggleListen={toggleListening}
        />

        {/* Live Spoken Speech Display Card */}
        <div id="voice-transcript-card" className="w-full max-w-2xl mt-4 px-4">
          <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-5 shadow-2xl backdrop-blur-md relative overflow-hidden">
            {/* Top user utterance indicator */}
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2 font-mono">
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
              <span>{transcript}</span>
            </div>

            {/* Main spoken response from LifeOS */}
            <p className="text-base sm:text-lg font-medium text-neutral-100 leading-relaxed">
              "{assistantSpokenText}"
            </p>

            {/* Quick verbal indicator */}
            <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
              <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                <Volume2 className="w-3.5 h-3.5" />
                <span>LifeOS Verbal Response</span>
              </span>
              <span className="text-neutral-500 font-mono">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Text Voice Input Fallback Bar */}
        <div className="w-full max-w-2xl px-4 mt-4">
          <form onSubmit={handleManualSubmit} className="relative flex items-center">
            <input
              id="voice-command-input"
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Or ask: 'Mapla, enna pending?' or 'Complete the assignment'..."
              disabled={emergencyStop}
              className="w-full pl-4 pr-12 py-3 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-cyan-500 focus:outline-none text-sm text-neutral-100 placeholder:text-neutral-500 transition-all shadow-inner disabled:opacity-50"
            />
            <button
              id="send-voice-command"
              type="submit"
              disabled={!userInput.trim() || emergencyStop}
              className="absolute right-2 p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-white transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* 10-Step Autonomous Intelligence Loop */}
        <IntelligenceLoop
          currentStage={currentStep}
          voiceState={voiceState}
          lastTrigger={lastTrigger}
        />

        {/* Real Google Workspace, Classroom & Coursework Completion Panel */}
        <GoogleWorkspacePanel
          user={googleUser}
          hasActiveToken={hasActiveToken}
          isSigningIn={isSigningIn}
          authError={authError}
          gmailError={gmailError}
          onSignIn={handleGoogleSignIn}
          onSignOut={handleSignOut}
          onSyncAll={async () => {
            const token = getAccessToken();
            if (token) {
              await syncGoogleData(token, googleUser?.email || "rangasmyakash@gmail.com", googleUser?.displayName || "Akash R");
            } else {
              await handleGoogleSignIn();
            }
          }}
          courses={courses}
          coursework={coursework}
          emails={emails}
          calendar={calendarEvents}
          isSyncing={isSyncing}
          onCompleteWork={handleCompleteWork}
          onTalkFirst={handleTalkFirst}
          autoWatcherActive={autoWatcherActive}
          onToggleAutoWatcher={() => setAutoWatcherActive(!autoWatcherActive)}
        />

        {/* Quick Demo Prompts & Proactive Simulators */}
        <DemoPrompts
          onSelectPrompt={handleVoiceCommand}
          onSimulateEvent={handleSimulateEvent}
          disabled={emergencyStop}
        />
      </main>

      {/* Footer Minimal Info */}
      <footer className="w-full border-t border-neutral-800/80 py-3 px-4 text-center text-xs text-neutral-500">
        LifeOS AI · Connected to Gmail, Google Classroom & Calendar · Voice-First Academic Assistant for Akash R
      </footer>

      {/* Action Log Modal */}
      <ActionLogModal
        isOpen={showActionLogs}
        onClose={() => setShowActionLogs(false)}
        logs={actionLogs}
      />

      {/* Permission Engine Modal */}
      <PermissionModal
        isOpen={showPermissions}
        onClose={() => setShowPermissions(false)}
        grantedCapabilities={grantedCapabilities}
        onToggleCapability={handleToggleCapability}
      />

      {/* Complete The Work Modal */}
      <WorkCompletionModal
        isOpen={showSolutionModal}
        onClose={() => setShowSolutionModal(false)}
        data={selectedSolution}
        onSpeakSummary={(txt) => speakText(txt)}
      />
    </div>
  );
}
