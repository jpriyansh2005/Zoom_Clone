"use client";

import { History } from "lucide-react";

import { useDashboard } from "./DashboardProvider";
import { EmptyState, ErrorState, ListSkeleton } from "./ListStates";
import { RecentMeetingRow } from "./MeetingRows";

type RecentMeetingsProps = {
  /** Show only the first few on the home screen; leave out to show all. */
  limit?: number;
};

export function RecentMeetings({ limit }: RecentMeetingsProps) {
  const { recent, loading, error, reload } = useDashboard();
  const shown = limit ? recent.slice(0, limit) : recent;

  if (error && recent.length === 0) return <ErrorState message={error} onRetry={reload} />;
  if (loading && recent.length === 0) return <ListSkeleton />;
  if (recent.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No recent meetings"
        hint="Meetings you have hosted will show up here."
      />
    );
  }
  return (
    <ul className="pb-2">
      {shown.map((meeting) => (
        <RecentMeetingRow key={meeting.id} meeting={meeting} />
      ))}
    </ul>
  );
}
