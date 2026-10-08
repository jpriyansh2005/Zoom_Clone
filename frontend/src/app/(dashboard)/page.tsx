import type { Metadata } from "next";
import Link from "next/link";

import { ActionTiles } from "@/components/dashboard/ActionTiles";
import { RecentMeetings } from "@/components/dashboard/RecentMeetings";
import { UpcomingPanel } from "@/components/dashboard/UpcomingPanel";

export const metadata: Metadata = { title: "Home" };

/** How many past meetings the home screen lists before "View all". */
const RECENT_ON_HOME = 4;

/**
 * Phones and tablets: one column in reading order (actions, upcoming, recent).
 * Desktop: actions and recent on the left, the upcoming card on the right
 * spanning both rows, which is how Zoom's home screen is arranged.
 */
export default function HomePage() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:grid-rows-[auto_1fr] lg:gap-x-10">
      <section aria-label="Meeting actions" className="flex justify-center py-2 sm:py-8">
        <ActionTiles />
      </section>

      <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <UpcomingPanel />
      </div>

      <section
        aria-labelledby="recent-heading"
        className="rounded-2xl border border-line bg-white shadow-card"
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-1">
          <h2 id="recent-heading" className="text-[15px] font-bold">
            Recent meetings
          </h2>
          <Link
            href="/meetings?tab=previous"
            className="text-[13px] font-bold text-zoom-blue hover:underline"
          >
            View all
          </Link>
        </div>
        <RecentMeetings limit={RECENT_ON_HOME} />
      </section>
    </div>
  );
}
