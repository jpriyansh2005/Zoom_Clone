"use client";

import { CalendarDays } from "lucide-react";
import Link from "next/link";

import { useNow } from "@/hooks/useNow";
import { formatLongDate, formatTime } from "@/lib/datetime";

import { useDashboard } from "./DashboardProvider";
import { EmptyState, ErrorState, ListSkeleton } from "./ListStates";
import { groupByDay, UpcomingMeetingRow } from "./MeetingRows";

/** How many meetings the home screen shows before linking to the full list. */
const HOME_LIMIT = 4;

/** The card on the right of Zoom's home: a clock and the next meetings. */
export function UpcomingPanel() {
  const { upcoming, loading, error, reload } = useDashboard();
  const shown = upcoming.slice(0, HOME_LIMIT);

  return (
    <section
      aria-labelledby="upcoming-heading"
      className="rounded-2xl border border-line bg-white shadow-card"
    >
      <ClockBanner />

      <div className="flex items-center justify-between px-5 pt-4 pb-1">
        <h2 id="upcoming-heading" className="text-[15px] font-bold">
          Upcoming meetings
        </h2>
        {upcoming.length > HOME_LIMIT && (
          <Link href="/meetings" className="text-[13px] font-bold text-zoom-blue hover:underline">
            View all ({upcoming.length})
          </Link>
        )}
      </div>

      {error && upcoming.length === 0 ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && upcoming.length === 0 ? (
        <ListSkeleton />
      ) : upcoming.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No upcoming meetings"
          hint="Meetings you schedule will show up here."
        />
      ) : (
        <div className="pb-2">
          {groupByDay(shown).map((group) => (
            <div key={group.day}>
              <h3 className="px-5 pt-3 pb-1 text-[12px] font-bold tracking-wide text-ink-muted uppercase">
                {group.day}
              </h3>
              <ul>
                {group.meetings.map((meeting) => (
                  <UpcomingMeetingRow key={meeting.id} meeting={meeting} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ClockBanner() {
  const now = useNow();

  return (
    <div className="relative h-36 overflow-hidden rounded-t-[15px] bg-gradient-to-br from-[#0b5cff] via-[#2a4fe0] to-[#5b2dd1] px-6 text-white">
      {/* Soft shapes standing in for the photo Zoom shows behind the clock. */}
      <span className="absolute -top-10 -right-8 size-40 rounded-full bg-white/10" />
      <span className="absolute right-16 -bottom-16 size-36 rounded-full bg-white/10" />
      <div className="relative flex h-full flex-col justify-center">
        {/* Reserve the height so the card does not jump when the time appears. */}
        <p className="h-11 text-[40px] leading-none font-bold tracking-tight tabular-nums">
          {now && formatTime(now)}
        </p>
        <p className="mt-2 h-5 text-[15px] text-white/90">{now && formatLongDate(now)}</p>
      </div>
    </div>
  );
}
