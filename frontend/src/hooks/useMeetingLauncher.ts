"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/components/ui/Toast";
import { api, errorMessage } from "@/lib/api";
import { type MediaPreferences, saveSession } from "@/lib/session";

/** Hosts start with the camera on and the microphone muted. */
const HOST_MEDIA: MediaPreferences = { audio: false, video: true };

/** Actions that take the logged-in user into a meeting room as its host. */
export function useMeetingLauncher() {
  const router = useRouter();
  const showToast = useToast();
  const [isLaunching, setIsLaunching] = useState(false);

  async function launch(getCode: () => Promise<string>) {
    if (isLaunching) return; // ignore double clicks
    setIsLaunching(true);
    try {
      const code = await getCode();
      const session = await api.startMeeting(code);
      saveSession(session, HOST_MEDIA);
      router.push(`/meeting/${code}`);
    } catch (error) {
      showToast(errorMessage(error));
      setIsLaunching(false);
    }
  }

  return {
    isLaunching,
    /** "New Meeting": create a meeting and go straight into it. */
    startInstantMeeting: () => launch(async () => (await api.createInstantMeeting()).code),
    /** "Start" on a scheduled meeting. */
    startMeeting: (code: string) => launch(async () => code),
  };
}
