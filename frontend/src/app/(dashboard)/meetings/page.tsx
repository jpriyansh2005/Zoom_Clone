import type { Metadata } from "next";
import { Suspense } from "react";

import { ListSkeleton } from "@/components/dashboard/ListStates";
import { MeetingsView } from "@/components/dashboard/MeetingsView";

export const metadata: Metadata = { title: "Meetings" };

export default function MeetingsPage() {
  // MeetingsView reads the ?tab= query string, which is only known in the
  // browser. Next.js requires such components to sit inside <Suspense>,
  // and shows the fallback until the component is ready.
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[760px]">
          <h1 className="mb-5 text-2xl font-bold">Meetings</h1>
          <div className="rounded-2xl border border-line bg-white shadow-card">
            <ListSkeleton rows={4} />
          </div>
        </div>
      }
    >
      <MeetingsView />
    </Suspense>
  );
}
