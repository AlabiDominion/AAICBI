"use client";
import { useEffect, useState } from "react";
import { loadSessionSummary, type SessionSummary } from "@/lib/clientSession";

export function useSessionSummary(pathname: string, enabled = true): SessionSummary | null {
  const [result, setResult] = useState<{ path: string; summary: SessionSummary } | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    loadSessionSummary(pathname).then((summary) => {
      if (live) setResult({ path: pathname, summary });
    });
    return () => { live = false; };
  }, [pathname, enabled]);
  return enabled && result?.path === pathname ? result.summary : null;
}
