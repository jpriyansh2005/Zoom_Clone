"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

export type MenuItem = {
  label: string;
  onSelect: () => void;
  icon?: ReactNode;
  /** Show the item in red, for destructive actions. */
  danger?: boolean;
};

type DropdownMenuProps = {
  /** Accessible name of the button that opens the menu. */
  label: string;
  /** What the button looks like (an icon, an avatar...). */
  trigger: ReactNode;
  items: MenuItem[];
  /** Optional content above the items, e.g. the user's name. */
  header?: ReactNode;
  align?: "left" | "right";
  triggerClassName?: string;
};

export function DropdownMenu({
  label,
  trigger,
  items,
  header,
  align = "right",
  triggerClassName,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // While open, close on a click anywhere else or on Escape.
  useEffect(() => {
    if (!isOpen) return;

    function closeOnOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={triggerClassName}
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          role="menu"
          className={cn(
            "absolute top-full z-30 mt-1.5 min-w-48 animate-pop-in rounded-xl border border-line bg-white py-1.5 shadow-popover",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {header && <div className="mb-1.5 border-b border-line px-4 pt-1.5 pb-3">{header}</div>}
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                item.onSelect();
              }}
              className={cn(
                "flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm whitespace-nowrap hover:bg-hover",
                item.danger ? "text-zoom-red" : "text-ink",
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
