import type { Metadata } from "next";
import { Suspense } from "react";

import { MeetingsView } from "@/components/dashboard/MeetingsView";

export const metadata: Metadata = { title: "Meetings" };

export default function MeetingsPage() {
  // MeetingsView reads the ?tab= query string, which is only known in the
  // browser. Next.js requires such components to sit inside <Suspense>.
  return (
    <Suspense>
      <MeetingsView />
    </Suspense>
  );
}
