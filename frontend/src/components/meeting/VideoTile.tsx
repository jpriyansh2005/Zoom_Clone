"use client";

import { MicOff } from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import type { Reaction } from "@/hooks/useMeetingRoom";

import { MediaPlayer } from "./MediaPlayer";

type VideoTileProps = {
  name: string;
  isSelf: boolean;
  isHost: boolean;
  audioOn: boolean;
  /** Whether a camera picture should be visible. */
  videoOn: boolean;
  isSharingScreen: boolean;
  source: MediaStream | MediaStreamTrack | null;
  width: number;
  height: number;
  reactions: Reaction[];
  retryKey: number;
  onAutoplayBlocked: () => void;
};

/** One person in the gallery: their video, or their initials when it is off. */
export function VideoTile({
  name,
  isSelf,
  isHost,
  audioOn,
  videoOn,
  isSharingScreen,
  source,
  width,
  height,
  reactions,
  retryKey,
  onAutoplayBlocked,
}: VideoTileProps) {
  const showsPicture = videoOn || isSharingScreen;
  const label = [name, isSelf && "(You)", isHost && "· Host"].filter(Boolean).join(" ");

  return (
    <div
      className="relative overflow-hidden rounded-xl bg-room-tile"
      style={{ width, height }}
    >
      <MediaPlayer
        source={source}
        muted={isSelf}
        mirrored={isSelf && !isSharingScreen}
        fit={isSharingScreen ? "contain" : "cover"}
        hidden={!showsPicture}
        retryKey={retryKey}
        onAutoplayBlocked={onAutoplayBlocked}
      />

      {!showsPicture && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Avatar name={name} size={Math.max(48, Math.min(height * 0.36, 128))} />
        </div>
      )}

      <div className="absolute bottom-2 left-2 flex max-w-[calc(100%-1rem)] items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-[13px] leading-none text-white">
        {!audioOn && <MicOff size={13} className="shrink-0 text-zoom-red" aria-label="Muted" />}
        <span className="truncate">{label}</span>
      </div>

      {reactions.map((reaction) => (
        <span
          key={reaction.id}
          aria-hidden
          className="absolute bottom-10 left-4 animate-float-up text-4xl"
        >
          {reaction.emoji}
        </span>
      ))}
    </div>
  );
}
