"use client";

import { type ReactNode, useRef, useState } from "react";

import { useDismiss } from "@/hooks/useDismiss";
import { cn } from "@/lib/cn";

type PopoverProps = {
  /** Accessible name of the button that opens the popover. */
  label: string;
  /** What the button looks like. */
  trigger: ReactNode;
  triggerClassName?: string;
  /** Open above or below the button. */
  placement?: "top" | "bottom";
  align?: "start" | "center" | "end";
  panelClassName?: string;
  /** The content. It receives a function that closes the popover. */
  children: (close: () => void) => ReactNode;
};

const ALIGN_CLASSES = {
  start: "left-0",
  center: "left-1/2 -translate-x-1/2",
  end: "right-0",
};

/** A button that opens a small floating panel next to itself. */
export function Popover({
  label,
  trigger,
  triggerClassName,
  placement = "bottom",
  align = "center",
  panelClassName,
  children,
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const close = () => setIsOpen(false);

  useDismiss(containerRef, isOpen, close);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {isOpen && (
        <div
          className={cn(
            "absolute z-40 animate-pop-in",
            placement === "top" ? "bottom-full mb-2" : "top-full mt-2",
            ALIGN_CLASSES[align],
            panelClassName,
          )}
        >
          {children(close)}
        </div>
      )}
    </div>
  );
}
