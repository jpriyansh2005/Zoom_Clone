"use client";

import { ChevronLeft, ChevronRight, CalendarDays, Ellipsis, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { useNow } from "@/hooks/useNow";
import { addDays, formatAgendaDate, formatLongDateWithYear, formatTime, startOfDay } from "@/lib/datetime";

import { useDashboard } from "./DashboardProvider";
import { ErrorState, ListSkeleton } from "./ListStates";
import { groupByDay, UpcomingMeetingRow } from "./MeetingRows";

/** How many meetings the home screen shows before linking to the full list. */
const HOME_LIMIT = 3;

const ICON_BUTTON =
  "flex size-7 items-center justify-center rounded-md text-ink hover:bg-hover disabled:cursor-not-allowed disabled:text-ink-faint disabled:hover:bg-transparent";

/** The large clock at the top of Zoom's home screen. */
export function HomeClock() {
  const now = useNow();
  return (
    <div className="text-center">
      {/* Fixed heights keep the layout still while the time loads. */}
      <p className="h-8 text-[32px] leading-none font-bold tracking-tight tabular-nums">
        {now && formatTime(now)}
      </p>
      <p className="mt-2.5 h-4 text-[13px] leading-none text-ink-muted">
        {now && formatLongDateWithYear(now)}
      </p>
    </div>
  );
}

/**
 * The calendar card on Zoom's home screen: upcoming meetings as an agenda
 * that starts on the selected day. The arrows move that day forwards and
 * back; "Today" returns to today.
 */
export function UpcomingPanel() {
  const { upcoming, loading, error, reload, openScheduleDialog, openJoinDialog } = useDashboard();
  const router = useRouter();
  const now = useNow(60_000);
  // How many days after today the agenda starts.
  const [dayOffset, setDayOffset] = useState(0);

  const firstDay = now ? addDays(startOfDay(now), dayOffset) : null;
  // Today's agenda also keeps a meeting that started earlier and is still running.
  const fromDay =
    firstDay && dayOffset > 0
      ? upcoming.filter((meeting) => new Date(meeting.scheduled_start ?? 0) >= firstDay)
      : upcoming;
  const shown = fromDay.slice(0, HOME_LIMIT);

  return (
    <section aria-labelledby="upcoming-heading" className="rounded-lg border border-line">
      <header className="relative flex h-[38px] items-center justify-center rounded-t-lg border-b border-line bg-canvas">
        <button
          type="button"
          aria-label="Schedule a meeting"
          onClick={() => openScheduleDialog()}
          className={`${ICON_BUTTON} absolute left-2`}
        >
          <Plus size={17} />
        </button>
        <p className="h-4 text-[13px] leading-4 font-semibold">
          {firstDay && now && formatAgendaDate(firstDay, now)}
        </p>
      </header>

      <div className="flex h-[39px] items-center gap-1 border-b border-line px-3">
        <button
          type="button"
          onClick={() => setDayOffset(0)}
          className="flex h-6 items-center gap-1.5 rounded-md border border-field px-2 text-[12px] hover:bg-hover"
        >
          <CalendarDays size={12} />
          Today
        </button>
        <button
          type="button"
          aria-label="Previous day"
          disabled={dayOffset === 0}
          onClick={() => setDayOffset((offset) => offset - 1)}
          className={ICON_BUTTON}
        >
          <ChevronLeft size={15} />
        </button>
        <button
          type="button"
          aria-label="Next day"
          onClick={() => setDayOffset((offset) => offset + 1)}
          className={ICON_BUTTON}
        >
          <ChevronRight size={15} />
        </button>
        <div className="ml-auto">
          <DropdownMenu
            label="Meeting options"
            trigger={<Ellipsis size={16} />}
            triggerClassName={ICON_BUTTON}
            items={[
              { label: "Schedule a meeting", onSelect: () => openScheduleDialog() },
              { label: "Join a meeting", onSelect: openJoinDialog },
              { label: "View all meetings", onSelect: () => router.push("/meetings") },
            ]}
          />
        </div>
      </div>

      <div className="min-h-[220px]">
        <h2 id="upcoming-heading" className="px-4 pt-3.5 text-[13px] font-semibold">
          Upcoming meetings
        </h2>

        {error && upcoming.length === 0 ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading && upcoming.length === 0 ? (
          <ListSkeleton />
        ) : shown.length === 0 ? (
          <div className="flex flex-col items-center px-6 pt-8 pb-10 text-center">
            <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-zoom-blue-soft text-zoom-blue">
              <CalendarDays size={26} strokeWidth={1.6} />
            </span>
            <p className="text-[13px] text-ink-muted">No meetings scheduled.</p>
            <button
              type="button"
              onClick={() => openScheduleDialog()}
              className="mt-2 flex items-center gap-1 text-[13px] text-zoom-blue hover:underline"
            >
              <Plus size={14} />
              Schedule a meeting
            </button>
          </div>
        ) : (
          <div className="pb-1.5">
            {groupByDay(shown).map((group) => (
              <div key={group.day}>
                <h3 className="px-4 pt-3 pb-0.5 text-[12px] text-ink-muted">{group.day}</h3>
                <ul>
                  {group.meetings.map((meeting) => (
                    <UpcomingMeetingRow key={meeting.id} meeting={meeting} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-line">
        <Link
          href="/meetings"
          className="flex h-[35px] items-center gap-1 rounded-b-lg px-4 text-[13px] text-ink hover:bg-hover"
        >
          {fromDay.length > HOME_LIMIT ? `View all ${fromDay.length} meetings` : "Open meetings"}
          <ChevronRight size={14} />
        </Link>
      </footer>
    </section>
  );
}
