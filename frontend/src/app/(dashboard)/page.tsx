import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ActionTiles } from "@/components/dashboard/ActionTiles";
import { RecentMeetings } from "@/components/dashboard/RecentMeetings";
import { HomeClock, UpcomingPanel } from "@/components/dashboard/UpcomingPanel";

export const metadata: Metadata = { title: "Home" };

/** How many past meetings the home screen lists before "View all". */
const RECENT_ON_HOME = 3;

/**
 * Zoom's home screen is one centred column: the clock, the quick actions,
 * then the calendar card. The recent meetings card below it is this
 * project's addition, because the assignment asks for one on the dashboard.
 */
export default function HomePage() {
  return (
    <div className="pt-8 md:pt-[min(110px,11vh)]">
      <HomeClock />

      <section aria-label="Meeting actions" className="mt-7">
        <ActionTiles />
      </section>

      <div className="mt-6">
        <UpcomingPanel />
      </div>

      <section aria-labelledby="recent-heading" className="mt-4 rounded-lg border border-line">
        <header className="flex h-[38px] items-center rounded-t-lg border-b border-line bg-canvas px-4">
          <h2 id="recent-heading" className="text-[13px] font-semibold">
            Recent meetings
          </h2>
        </header>
        <RecentMeetings limit={RECENT_ON_HOME} />
        <footer className="border-t border-line">
          <Link
            href="/meetings?tab=previous"
            className="flex h-[35px] items-center gap-1 rounded-b-lg px-4 text-[13px] text-ink hover:bg-hover"
          >
            View all
            <ChevronRight size={14} />
          </Link>
        </footer>
      </section>
    </div>
  );
}
