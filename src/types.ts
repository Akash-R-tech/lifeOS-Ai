export type VoiceState = "IDLE" | "LISTENING" | "REASONING" | "ACTING" | "SPEAKING" | "EMERGENCY_STOP";

export interface ActionLog {
  id: string;
  timestamp: string;
  trigger: string;
  action: string;
  target: string;
  permission: string;
  result: string;
  verified: boolean;
  details?: any;
}

export interface SystemEvent {
  id: string;
  eventType: string;
  timestamp: string;
  source: string;
  data: any;
  importance: "SILENT" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface IntelligenceStep {
  id: string;
  label: string;
  description: string;
  status: "pending" | "active" | "completed";
}

export interface SystemHealth {
  status: string;
  system: string;
  voiceTone: string;
  geminiConfigured: boolean;
}

export interface GoogleUser {
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  uid: string;
}

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  room?: string;
}

export interface ClassroomCoursework {
  id: string;
  courseId: string;
  courseName?: string;
  title: string;
  description?: string;
  state?: string;
  alternateLink?: string;
  creationTime?: string;
  dueDate?: { year: number; month: number; day: number };
  dueTime?: { hours: number; minutes: number };
  maxPoints?: number;
  workType?: string;
  // Augmented by LifeOS Work Completion Engine
  priorityScore?: number;
  solutionDraft?: string;
  keySteps?: string[];
  suggestedCode?: string;
  workspaceCreated?: boolean;
}

export interface GmailMessageItem {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  body?: string;
  isAssignmentRelated?: boolean;
}

export interface CalendarEventItem {
  id: string;
  summary: string;
  start: string;
  end: string;
  description?: string;
}

export interface WorkCompletionData {
  courseworkId: string;
  title: string;
  courseName: string;
  status: "READY" | "GENERATING" | "FAILED";
  summary: string;
  breakdown: string[];
  stepByStepSolution: string;
  codeSnippet?: string;
  workspaceFiles: { name: string; content: string }[];
  recommendedSchedule: { start: string; end: string; task: string }[];
}
