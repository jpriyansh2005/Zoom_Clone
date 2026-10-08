"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Spinner } from "@/components/ui/Spinner";
import { loadSession } from "@/lib/session";

import { MeetingRoom } from "./MeetingRoom";

/**
 * Decides what /meeting/[code] shows. Someone who has joined (a session is
 * stored for this tab) enters the room. Anyone else, for example a person
 * who pasted the room's address, is sent to the pre-join page first.
 */
export function RoomGate({ code }: { code: string }) {
  const router = useRouter();
  // Read once when the component is created; later changes to storage (the
  // session is cleared on leaving) must not pull the room out from under us.
  const [session] = useState(() => loadSession(code));

  useEffect(() => {
    if (!session) router.replace(`/j/${code}`);
  }, [session, code, router]);

  if (!session) {
    return (
      <div className="flex h-dvh items-center justify-center bg-room text-room-text">
        <Spinner className="size-7" />
      </div>
    );
  }
  return <MeetingRoom session={session} />;
}
