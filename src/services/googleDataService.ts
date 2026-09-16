import {
  GmailMessageItem,
  ClassroomCourse,
  ClassroomCoursework,
  CalendarEventItem,
} from "../types";

export interface SyncResult {
  emails: GmailMessageItem[];
  courses: ClassroomCourse[];
  coursework: ClassroomCoursework[];
  calendar: CalendarEventItem[];
  newAssignmentsDetected: number;
}

export interface FetchGmailResult {
  messages: GmailMessageItem[];
  error?: string | null;
  status?: number;
}

/**
 * Fetches recent Gmail messages and inspects subject & snippet for coursework/assignments.
 * Queries both recent inbox items and targeted academic search terms.
 */
export async function fetchGmailMessages(token: string): Promise<FetchGmailResult> {
  if (!token) {
    return {
      messages: [],
      error: "No Google authorization token provided. Please click 'Sign in with Google' to connect your Gmail account.",
    };
  }

  try {
    // 1. Fetch recent messages
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!listRes.ok) {
      let errDetail = "";
      try {
        const errJson = await listRes.json();
        errDetail = errJson?.error?.message || "";
      } catch {
        errDetail = await listRes.text();
      }

      console.warn("Gmail API list returned status:", listRes.status, errDetail);

      if (listRes.status === 401) {
        return {
          messages: [],
          status: 401,
          error: "Your Google session has expired. Please click 'Sign in with Google' to re-authenticate.",
        };
      }
      if (listRes.status === 403) {
        return {
          messages: [],
          status: 403,
          error: `Gmail access permission not granted: ${errDetail || "Scope 'gmail.readonly' required. Please sign in and grant access."}`,
        };
      }

      return {
        messages: [],
        status: listRes.status,
        error: `Gmail API error (${listRes.status}): ${errDetail || "Failed to list emails"}`,
      };
    }

    const listData = await listRes.json();
    const messageIdSet = new Set<string>();

    if (listData.messages && Array.isArray(listData.messages)) {
      listData.messages.forEach((m: { id: string }) => {
        if (m.id) messageIdSet.add(m.id);
      });
    }

    // 2. Also run an academic query to ensure coursework emails are captured even if buried
    try {
      const searchQuery = encodeURIComponent(
        "assignment OR coursework OR homework OR submission OR deadline OR project OR exam OR lab OR quiz OR marks OR grade"
      );
      const searchRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${searchQuery}&maxResults=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.messages && Array.isArray(searchData.messages)) {
          searchData.messages.forEach((m: { id: string }) => {
            if (m.id) messageIdSet.add(m.id);
          });
        }
      }
    } catch (e) {
      console.warn("Supplementary academic search query skipped:", e);
    }

    const uniqueIds = Array.from(messageIdSet).slice(0, 16);
    const messages: GmailMessageItem[] = [];

    // 3. Fetch details for each message in parallel
    const detailsPromises = uniqueIds.map(async (msgId: string) => {
      try {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!detailRes.ok) return null;
        const detail = await detailRes.json();
        const headers = detail.payload?.headers || [];
        const from = headers.find((h: any) => h.name.toLowerCase() === "from")?.value || "Unknown";
        const subject = headers.find((h: any) => h.name.toLowerCase() === "subject")?.value || "(No Subject)";
        const date = headers.find((h: any) => h.name.toLowerCase() === "date")?.value || "";

        const isAssignmentRelated =
          /assignment|coursework|homework|submission|deadline|due|project|lab|quiz|exam|midterm|test|marks|grade|evaluation|canvas|classroom|moodle|syllabus|faculty|professor|student|solve|report/i.test(
            `${subject} ${detail.snippet || ""}`
          );

        return {
          id: detail.id,
          threadId: detail.threadId,
          from,
          subject,
          date,
          snippet: detail.snippet || "",
          isAssignmentRelated,
        };
      } catch {
        return null;
      }
    });

    const resolved = await Promise.all(detailsPromises);
    for (const item of resolved) {
      if (item) messages.push(item);
    }

    return {
      messages,
      error: null,
      status: 200,
    };
  } catch (err: any) {
    console.error("fetchGmailMessages error:", err);
    return {
      messages: [],
      error: err.message || "Network error fetching Gmail messages",
    };
  }
}

/**
 * Fetches active courses from Google Classroom.
 */
export async function fetchClassroomCourses(token: string): Promise<ClassroomCourse[]> {
  try {
    const res = await fetch("https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.warn("Google Classroom courses returned status:", res.status);
      return [];
    }

    const data = await res.json();
    return (data.courses || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      section: c.section,
      descriptionHeading: c.descriptionHeading,
      room: c.room,
    }));
  } catch (err) {
    console.error("fetchClassroomCourses error:", err);
    return [];
  }
}

/**
 * Fetches coursework assignments for all active courses from Google Classroom.
 */
export async function fetchClassroomCoursework(
  token: string,
  courses: ClassroomCourse[]
): Promise<ClassroomCoursework[]> {
  try {
    const allCoursework: ClassroomCoursework[] = [];

    for (const course of courses) {
      try {
        const res = await fetch(
          `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork?courseWorkStates=PUBLISHED`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) continue;

        const data = await res.json();
        if (data.courseWork && Array.isArray(data.courseWork)) {
          for (const cw of data.courseWork) {
            allCoursework.push({
              id: cw.id,
              courseId: course.id,
              courseName: course.name,
              title: cw.title,
              description: cw.description,
              state: cw.state,
              alternateLink: cw.alternateLink,
              creationTime: cw.creationTime,
              dueDate: cw.dueDate,
              dueTime: cw.dueTime,
              maxPoints: cw.maxPoints,
              workType: cw.workType,
            });
          }
        }
      } catch (e) {
        console.warn(`Error fetching coursework for course ${course.id}:`, e);
      }
    }

    return allCoursework;
  } catch (err) {
    console.error("fetchClassroomCoursework error:", err);
    return [];
  }
}

/**
 * Fetches today's Google Calendar events.
 */
export async function fetchGoogleCalendarEvents(token: string): Promise<CalendarEventItem[]> {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
      startOfDay.toISOString()
    )}&timeMax=${encodeURIComponent(endOfDay.toISOString())}&singleEvents=true&orderBy=startTime`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return (data.items || []).map((item: any) => ({
      id: item.id,
      summary: item.summary || "(No Title)",
      start: item.start?.dateTime || item.start?.date || "",
      end: item.end?.dateTime || item.end?.date || "",
      description: item.description,
    }));
  } catch (err) {
    console.error("fetchGoogleCalendarEvents error:", err);
    return [];
  }
}
