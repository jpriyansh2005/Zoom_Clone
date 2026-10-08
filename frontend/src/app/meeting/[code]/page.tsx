import type { Metadata } from "next";

import { RoomGate } from "@/components/meeting/BrowserOnly";

export const metadata: Metadata = { title: "Meeting" };

export default async function MeetingPage({ params }: PageProps<"/meeting/[code]">) {
  const { code } = await params;
  return <RoomGate code={code} />;
}
