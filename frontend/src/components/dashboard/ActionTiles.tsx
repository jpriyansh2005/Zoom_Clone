"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

import { useDashboard } from "./DashboardProvider";

/** The row of quick actions under the clock on Zoom's home screen. */
export function ActionTiles() {
  const { isLaunching, startInstantMeeting, openJoinDialog, openScheduleDialog } = useDashboard();
  const showToast = useToast();

  return (
    <div className="flex justify-center">
      <Tile
        label="New meeting"
        color="orange"
        hasMenuCaret
        busy={isLaunching}
        onClick={startInstantMeeting}
        icon={
          <>
            <rect x="3" y="7" width="12.5" height="10" rx="2.6" />
            <path d="M16.6 10.6 20 8.4a.7.7 0 0 1 1 .6v6a.7.7 0 0 1-1 .6l-3.4-2.2z" />
          </>
        }
      />
      <Tile
        label="Join"
        onClick={openJoinDialog}
        icon={
          <>
            <rect x="4" y="4" width="16" height="16" rx="4.2" />
            <path d="M12 8.2v7.6M8.2 12h7.6" className={GLYPH_CUTOUT} />
          </>
        }
      />
      <Tile
        label="Schedule"
        onClick={() => openScheduleDialog()}
        icon={
          <>
            <rect x="7.4" y="2.8" width="2" height="4.4" rx="1" />
            <rect x="14.6" y="2.8" width="2" height="4.4" rx="1" />
            <rect x="4" y="5" width="16" height="15.2" rx="3.4" />
            <text
              x="12"
              y="17"
              textAnchor="middle"
              fontSize="8.4"
              fontWeight="700"
              className="fill-zoom-blue"
            >
              31
            </text>
          </>
        }
      />
      <Tile
        label="Share screen"
        onClick={() => showToast("Start or join a meeting to share your screen")}
        icon={
          <>
            <rect x="3.2" y="5.6" width="17.6" height="12.8" rx="3.2" />
            <path d="M12 15.2V9.4M9.4 11.8 12 9.2l2.6 2.6" className={GLYPH_CUTOUT} />
          </>
        }
      />
    </div>
  );
}

/** Lines drawn in the tile's blue on top of a white shape. */
const GLYPH_CUTOUT = "fill-none stroke-zoom-blue [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.9]";

type TileProps = {
  label: string;
  /** SVG shapes for the white glyph, drawn on a 24x24 grid. */
  icon: ReactNode;
  color?: "blue" | "orange";
  /** Show the small arrow Zoom puts after "New meeting". */
  hasMenuCaret?: boolean;
  busy?: boolean;
  onClick: () => void;
};

function Tile({ label, icon, color = "blue", hasMenuCaret = false, busy = false, onClick }: TileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="group flex w-1/4 max-w-[107px] flex-col items-center gap-2.5 rounded-xl py-1"
    >
      <span
        className={cn(
          "flex size-[50px] items-center justify-center rounded-[14px] text-white transition-colors",
          color === "orange"
            ? "bg-zoom-orange group-hover:bg-zoom-orange-hover"
            : "bg-zoom-blue group-hover:bg-zoom-blue-hover",
        )}
      >
        {busy ? (
          <Spinner className="size-5" />
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden className="size-7 fill-white">
            {icon}
          </svg>
        )}
      </span>
      <span className="flex items-center gap-1 text-[12px] leading-none text-ink">
        {label}
        {hasMenuCaret && <ChevronDown size={12} aria-hidden />}
      </span>
    </button>
  );
}
