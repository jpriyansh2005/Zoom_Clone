"use client";

import { type RefObject, useEffect, useEffectEvent } from "react";

/**
 * While `isOpen`, call `onDismiss` when the user clicks outside `ref` or
 * presses Escape. Shared by every menu and popover.
 */
export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  isOpen: boolean,
  onDismiss: () => void,
): void {
  // An effect event always sees the latest onDismiss without making the
  // effect below re-run (and re-attach listeners) on every render.
  const dismiss = useEffectEvent(onDismiss);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) dismiss();
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") dismiss();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [ref, isOpen]);
}
