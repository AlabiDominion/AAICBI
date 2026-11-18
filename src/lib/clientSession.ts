"use client";

export interface SessionSummary {
  signedIn: boolean;
  role?: string;
  name?: string;
  avatarUrl?: string | null;
  square?: boolean;
  handle?: string | null;
  kindLabel?: string | null;
  dashboardHref?: string;
}

let currentPath: string | null = null;
let pending: Promise<SessionSummary> | null = null;

/** Tab-local display data shared within a navigation, never authorization or persistent storage. */
export function loadSessionSummary(pathname: string): Promise<SessionSummary> {
  if (currentPath !== pathname || !pending) {
    currentPath = pathname;
    const request = fetch("/api/session/summary", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Session lookup failed");
        return response.json() as Promise<SessionSummary>;
      });
    const shared: Promise<SessionSummary> = request.catch(() => {
      // Don't preserve a transient failure as a permanent signed-out result.
      if (currentPath === pathname && pending === shared) pending = null;
      return { signedIn: false };
    });
    pending = shared;
  }
  return pending;
}
