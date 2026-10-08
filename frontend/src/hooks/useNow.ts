"use client";

import { useEffect, useState } from "react";

/**
 * The current time, refreshed on an interval.
 *
 * It starts as null and is set after the page has loaded in the browser.
 * The server's clock and timezone differ from the viewer's, so rendering a
 * time on the server would briefly show the wrong one.
 */
export function useNow(intervalMs: number = 1000): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const firstTick = setTimeout(tick, 0);
    const timer = setInterval(tick, intervalMs);
    return () => {
      clearTimeout(firstTick);
      clearInterval(timer);
    };
  }, [intervalMs]);

  return now;
}
