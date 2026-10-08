/** Typed wrapper around the backend's REST API. All network calls go through here. */

import { API_BASE_URL } from "./config";
import type { Meeting, MeetingSession, ScheduleMeetingInput, User } from "./types";

export class ApiError extends Error {
  /** HTTP status code, or 0 when the server could not be reached at all. */
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init.headers },
    });
  } catch {
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }

  if (response.status === 204) {
    return undefined as T;
  }
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, readErrorMessage(body));
  }
  return body as T;
}

/**
 * FastAPI reports errors as {"detail": "..."} for our own errors and as
 * {"detail": [{"msg": "..."}]} for request validation errors.
 */
function readErrorMessage(body: unknown): string {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail) && typeof detail[0]?.msg === "string") {
    return detail[0].msg;
  }
  return "Something went wrong. Please try again.";
}

function post<T>(path: string, body: unknown = {}): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export const api = {
  getCurrentUser: () => request<User>("/users/me"),

  listUpcomingMeetings: () => request<Meeting[]>("/meetings/upcoming"),
  listRecentMeetings: () => request<Meeting[]>("/meetings/recent"),
  getMeeting: (code: string) => request<Meeting>(`/meetings/${code}`),

  createInstantMeeting: () => post<Meeting>("/meetings/instant"),
  scheduleMeeting: (input: ScheduleMeetingInput) => post<Meeting>("/meetings", input),
  updateMeeting: (code: string, input: Partial<ScheduleMeetingInput>) =>
    request<Meeting>(`/meetings/${code}`, { method: "PATCH", body: JSON.stringify(input) }),
  deleteMeeting: (code: string) => request<void>(`/meetings/${code}`, { method: "DELETE" }),

  /** Enter as the host (marks the meeting live). */
  startMeeting: (code: string) => post<MeetingSession>(`/meetings/${code}/start`),
  /** Enter as a guest with the given display name. */
  joinMeeting: (code: string, displayName: string) =>
    post<MeetingSession>(`/meetings/${code}/join`, { display_name: displayName }),
};

/** Turn anything thrown into a message that is safe to show to the user. */
export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}
