"use client";

import { CalendarDays, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

import { useDashboard } from "./DashboardProvider";
import { EmptyState, ErrorState, ListSkeleton } from "./ListStates";
import { groupByDay, UpcomingMeetingRow } from "./MeetingRows";
import { RecentMeetings } from "./RecentMeetings";

type TabId = "upcoming" | "previous";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "upcoming", label: "Upcoming" },
  { id: "previous", label: "Previous" },
];

/** The Meetings tab: every upcoming and previous meeting, with actions. */
export function MeetingsView() {
  const { upcoming, recent, loading, error, reload, openScheduleDialog } = useDashboard();
  const router = useRouter();
  // The selected tab lives in the URL (?tab=previous) so it can be linked to
  // and survives a refresh.
  const activeTab: TabId = useSearchParams().get("tab") === "previous" ? "previous" : "upcoming";

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Meetings</h1>
        <Button onClick={() => openScheduleDialog()}>
          <Plus size={16} strokeWidth={2.5} />
          Schedule a meeting
        </Button>
      </div>

      <div role="tablist" aria-label="Meetings" className="flex gap-6 border-b border-line">
        {TABS.map((tab) => {
          const count = tab.id === "upcoming" ? upcoming.length : recent.length;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => router.replace(tab.id === "upcoming" ? "/meetings" : "/meetings?tab=previous")}
              className={cn(
                "-mb-px border-b-2 px-0.5 pb-2.5 text-[15px] font-bold transition-colors",
                activeTab === tab.id
                  ? "border-zoom-blue text-zoom-blue"
                  : "border-transparent text-ink-muted hover:text-ink",
              )}
            >
              {tab.label}
              {!loading && <span className="ml-1.5 font-normal">({count})</span>}
            </button>
          );
        })}
      </div>

      <section className="mt-5 rounded-2xl border border-line bg-white shadow-card">
        {activeTab === "previous" ? (
          <RecentMeetings />
        ) : error && upcoming.length === 0 ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading && upcoming.length === 0 ? (
          <ListSkeleton rows={4} />
        ) : upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No upcoming meetings"
            hint="Schedule a meeting and it will show up here."
          />
        ) : (
          <div className="py-2">
            {groupByDay(upcoming).map((group) => (
              <div key={group.day}>
                <h2 className="px-5 pt-3 pb-1 text-[12px] font-bold tracking-wide text-ink-muted uppercase">
                  {group.day}
                </h2>
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
    </div>
  );
}
