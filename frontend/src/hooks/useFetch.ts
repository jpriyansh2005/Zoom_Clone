"use client";

import { useEffect, useState } from "react";

import { errorMessage } from "@/lib/api";

type FetchState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

/**
 * Load data when a component appears, and again whenever `reload` is called.
 *
 * `fetcher` must be a stable function (defined outside the component),
 * otherwise the effect would run again on every render.
 */
export function useFetch<T>(fetcher: () => Promise<T>) {
  const [state, setState] = useState<FetchState<T>>({ data: null, error: null, loading: true });
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    // If the component goes away or reloads before the response arrives,
    // the late response must not overwrite newer state.
    let cancelled = false;

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState((previous) => ({ ...previous, error: errorMessage(error), loading: false }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetcher, reloadCount]);

  function reload() {
    setState((previous) => ({ ...previous, loading: true }));
    setReloadCount((count) => count + 1);
  }

  return { ...state, reload };
}
