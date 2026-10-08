"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  formatDayLabel,
  formatDuration,
  formatTime,
  formatTimeRange,
  minutesBetween,
} from "@/lib/datetime";
import { formatMeetingCode } from "@/lib/meetingCode";
import type { Meeting } from "@/lib/types";

import { useDashboard } from "./DashboardProvider";
import { MeetingActionsMenu } from "./MeetingActionsMenu";

const ROW_CLASS = "flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-hover/70";

/** A scheduled meeting that has not finished: time, topic, ID and "Start". */
export function UpcomingMeetingRow({ meeting }: { meeting: Meeting }) {
  const { startMeeting, isLaunching } = useDashboard();
  const isLive = meeting.status === "live";
  // Upcoming meetings are always scheduled ones, so both values are set.
  const start = new Date(meeting.scheduled_start ?? meeting.created_at);

  return (
    <li className={ROW_CLASS}>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-[13px] text-ink-muted">
          {formatTimeRange(start, meeting.duration_minutes ?? 0)}
          {isLive && <StatusChip tone="live">Live</StatusChip>}
        </p>
        <p className="truncate text-[15px] font-bold">{meeting.title}</p>
        <p className="text-[13px] text-ink-muted">Meeting ID: {formatMeetingCode(meeting.code)}</p>
      </div>
      <Button size="sm" disabled={isLaunching} onClick={() => startMeeting(meeting)}>
        {isLive ? "Rejoin" : "Start"}
      </Button>
      <MeetingActionsMenu meeting={meeting} />
    </li>
  );
}

/** A meeting from the past: when it happened and how long it ran. */
export function RecentMeetingRow({ meeting }: { meeting: Meeting }) {
  const { startMeeting, isLaunching } = useDashboard();
  const isLive = meeting.status === "live";
  const when = new Date(
    meeting.ended_at ?? meeting.started_at ?? meeting.scheduled_start ?? meeting.created_at,
  );

  return (
    <li className={ROW_CLASS}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold">{meeting.title}</p>
        <p className="truncate text-[13px] text-ink-muted">
          {formatDayLabel(when)}, {formatTime(when)}
          {" · "}
          {recentDuration(meeting)}
          {" · "}
          ID {formatMeetingCode(meeting.code)}
        </p>
      </div>
      {isLive ? (
        <Button size="sm" disabled={isLaunching} onClick={() => startMeeting(meeting)}>
          Rejoin
        </Button>
      ) : (
        <StatusChip tone="neutral">{meeting.status === "ended" ? "Ended" : "Not started"}</StatusChip>
      )}
      <MeetingActionsMenu meeting={meeting} />
    </li>
  );
}

/** How long the meeting really ran, or its planned length if it never ended. */
function recentDuration(meeting: Meeting): string {
  if (meeting.status === "live") return "In progress";
  if (meeting.started_at && meeting.ended_at) {
    return formatDuration(minutesBetween(new Date(meeting.started_at), new Date(meeting.ended_at)));
  }
  return formatDuration(meeting.duration_minutes ?? 0);
}

function StatusChip({ tone, children }: { tone: "live" | "neutral"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] leading-4 font-bold whitespace-nowrap",
        tone === "live" ? "bg-zoom-green/15 text-[#0f8a48]" : "bg-canvas text-ink-muted",
      )}
    >
      {children}
    </span>
  );
}

/** Split meetings into runs that fall on the same day: Today, Tomorrow... */
export function groupByDay(meetings: Meeting[]): Array<{ day: string; meetings: Meeting[] }> {
  const groups: Array<{ day: string; meetings: Meeting[] }> = [];
  for (const meeting of meetings) {
    const day = formatDayLabel(new Date(meeting.scheduled_start ?? meeting.created_at));
    const lastGroup = groups[groups.length - 1];
    if (lastGroup?.day === day) {
      lastGroup.meetings.push(meeting);
    } else {
      groups.push({ day, meetings: [meeting] });
    }
  }
  return groups;
}
