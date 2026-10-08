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
        <div className="pt-8">
          <h1 className="mb-5 text-xl font-bold">Meetings</h1>
          <div className="rounded-lg border border-line">
            <ListSkeleton rows={4} />
          </div>
        </div>
      }
    >
      <MeetingsView />
    </Suspense>
  );
}
