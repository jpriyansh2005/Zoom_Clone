"use client";

import { CalendarDays, type LucideIcon, MonitorUp, Plus, Video } from "lucide-react";

import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

import { useDashboard } from "./DashboardProvider";

/** The four large buttons at the centre of Zoom's home screen. */
export function ActionTiles() {
  const { isLaunching, startInstantMeeting, openJoinDialog, openScheduleDialog } = useDashboard();
  const showToast = useToast();

  return (
    <div className="grid grid-cols-4 justify-items-center gap-x-2 gap-y-8 sm:grid-cols-2 sm:gap-x-14 sm:gap-y-10">
      <Tile
        label="New meeting"
        icon={Video}
        color="orange"
        busy={isLaunching}
        onClick={startInstantMeeting}
      />
      <Tile label="Join" icon={Plus} onClick={openJoinDialog} />
      <Tile label="Schedule" icon={CalendarDays} onClick={() => openScheduleDialog()} />
      <Tile
        label="Share screen"
        icon={MonitorUp}
        onClick={() => showToast("Start or join a meeting to share your screen")}
      />
    </div>
  );
}

type TileProps = {
  label: string;
  icon: LucideIcon;
  color?: "blue" | "orange";
  busy?: boolean;
  onClick: () => void;
};

function Tile({ label, icon: Icon, color = "blue", busy = false, onClick }: TileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="group flex w-20 flex-col items-center gap-2.5 rounded-2xl sm:w-28 sm:gap-3"
    >
      <span
        className={cn(
          "flex size-14 items-center justify-center rounded-[18px] text-white shadow-card transition-all sm:size-[84px] sm:rounded-[26px]",
          "group-hover:scale-[1.04] group-active:scale-[0.98]",
          color === "orange"
            ? "bg-zoom-orange group-hover:bg-zoom-orange-hover"
            : "bg-zoom-blue group-hover:bg-zoom-blue-hover",
        )}
      >
        {busy ? (
          <Spinner className="size-6 sm:size-8" />
        ) : (
          <Icon className="size-6 sm:size-9" strokeWidth={2} />
        )}
      </span>
      <span className="text-[13px] text-ink sm:text-sm">{label}</span>
    </button>
  );
}
