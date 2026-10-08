"use client";

import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { inputClassName } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { ZoomLogo } from "@/components/ui/ZoomLogo";
import { useFetch } from "@/hooks/useFetch";
import { useLocalMedia } from "@/hooks/useLocalMedia";
import { api, errorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatMeetingCode } from "@/lib/meetingCode";
import { rememberDisplayName, rememberedDisplayName, saveSession } from "@/lib/session";
import type { Meeting } from "@/lib/types";

import { MediaPlayer } from "./MediaPlayer";
import { RoomNotice } from "./RoomNotice";

/**
 * Where an invite link lands. It checks that the meeting exists, then asks
 * for a display name and shows a camera preview before joining.
 */
export function PreJoin({ code }: { code: string }) {
  // useCallback keeps the same function between renders, which useFetch
  // needs so that it only fetches again when the code changes.
  const loadMeeting = useCallback(() => api.getMeeting(code), [code]);
  const { data: meeting, error, loading } = useFetch(loadMeeting);

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-canvas text-zoom-blue">
        <Spinner className="size-7" />
      </div>
    );
  }
  if (!meeting) {
    return (
      <RoomNotice
        title="We couldn't find this meeting"
        message={error ?? "Check the meeting ID or invite link and try again."}
      />
    );
  }
  if (meeting.status === "ended") {
    return (
      <RoomNotice
        title="This meeting has ended"
        message={`"${meeting.title}" was ended by the host.`}
      />
    );
  }
  return <PreJoinForm meeting={meeting} />;
}

function PreJoinForm({ meeting }: { meeting: Meeting }) {
  const router = useRouter();
  const media = useLocalMedia({ audio: false, video: true });
  const [name, setName] = useState(rememberedDisplayName);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const displayName = name.trim();
    if (!displayName) return;

    setIsJoining(true);
    setError(null);
    try {
      const session = await api.joinMeeting(meeting.code, displayName);
      rememberDisplayName(displayName);
      // Carry the choices made here (mic and camera on or off) into the room.
      saveSession(session, { audio: media.audioOn, video: media.videoOn });
      router.push(`/meeting/${meeting.code}`);
    } catch (joinError) {
      setError(errorMessage(joinError));
      setIsJoining(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="flex h-16 shrink-0 items-center border-b border-line bg-white px-4 sm:px-6">
        <Link href="/" aria-label="Zoom home" className="rounded-md">
          <ZoomLogo withProduct />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="grid w-full max-w-[920px] items-center gap-8 md:grid-cols-[minmax(0,1fr)_340px]">
          <section aria-label="Camera preview">
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-room-tile shadow-card">
              <MediaPlayer source={media.cameraTrack} muted mirrored hidden={!media.videoOn} />
              {!media.videoOn && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Avatar name={name.trim() || "?"} size={96} />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3">
                <PreviewToggle
                  label={media.audioOn ? "Mute" : "Unmute"}
                  isOn={media.audioOn}
                  onClick={media.toggleAudio}
                  iconOn={<Mic size={20} />}
                  iconOff={<MicOff size={20} />}
                />
                <PreviewToggle
                  label={media.videoOn ? "Stop video" : "Start video"}
                  isOn={media.videoOn}
                  onClick={media.toggleVideo}
                  iconOn={<Video size={20} />}
                  iconOff={<VideoOff size={20} />}
                />
              </div>
            </div>
            {media.error && (
              <p role="alert" className="mt-3 text-center text-[13px] text-ink-muted">
                {media.error} You can still join without it.
              </p>
            )}
          </section>

          <form onSubmit={handleSubmit} className="text-center md:text-left">
            <h1 className="text-2xl font-bold break-words">{meeting.title}</h1>
            <p className="mt-1.5 text-sm text-ink-muted">
              Hosted by {meeting.host.name} · Meeting ID {formatMeetingCode(meeting.code)}
            </p>

            <label htmlFor="prejoin-name" className="mt-7 mb-1.5 block text-[13px] font-bold">
              Your name
            </label>
            <input
              id="prejoin-name"
              autoFocus
              maxLength={64}
              placeholder="Enter your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={cn(inputClassName, "h-11")}
            />
            {error && (
              <p role="alert" className="mt-2 text-[13px] text-zoom-red">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={!name.trim() || isJoining}
              className="mt-4 w-full"
            >
              {isJoining ? <Spinner className="size-4" /> : "Join"}
            </Button>
            <p className="mt-4 text-[12px] text-ink-faint">
              By joining, you agree that others in the meeting can see and hear you.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

type PreviewToggleProps = {
  label: string;
  isOn: boolean;
  onClick: () => void;
  iconOn: React.ReactNode;
  iconOff: React.ReactNode;
};

function PreviewToggle({ label, isOn, onClick, iconOn, iconOff }: PreviewToggleProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isOn}
      onClick={onClick}
      className={cn(
        "flex size-11 items-center justify-center rounded-full text-white transition-colors",
        isOn ? "bg-white/20 backdrop-blur hover:bg-white/30" : "bg-zoom-red hover:bg-zoom-red-hover",
      )}
    >
      {isOn ? iconOn : iconOff}
    </button>
  );
}
