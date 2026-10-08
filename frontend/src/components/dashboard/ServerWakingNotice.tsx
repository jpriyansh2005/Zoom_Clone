"use client";

import { useEffect, useState } from "react";

import { Spinner } from "@/components/ui/Spinner";

import { useDashboard } from "./DashboardProvider";

/** How long the first load may take before the notice appears. */
const SLOW_AFTER_MS = 4000;

/**
 * Free hosting tiers put the backend to sleep when nobody uses it, and the
 * first request afterwards can take up to a minute. This explains the wait
 * instead of leaving the visitor looking at placeholders.
 */
export function ServerWakingNotice() {
  const { loading, user } = useDashboard();
  const isFirstLoad = loading && user === null;
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    if (!isFirstLoad) return;
    const timer = setTimeout(() => setIsSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, [isFirstLoad]);

  if (!isFirstLoad || !isSlow) return null;

  return (
    <p
      role="status"
      className="mt-4 flex items-center gap-3 rounded-lg border border-line bg-canvas px-4 py-3 text-[13px] text-ink-muted"
    >
      <Spinner className="size-4 shrink-0 text-zoom-blue" />
      Waking up the server. On free hosting the first load can take up to a minute.
    </p>
  );
}
