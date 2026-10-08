"use client";

import { useEffect, useEffectEvent, useRef } from "react";

import { cn } from "@/lib/cn";

type MediaPlayerProps = {
  /** A remote participant's stream, or a single local track to preview. */
  source: MediaStream | MediaStreamTrack | null;
  /** Mute our own preview so we do not hear ourselves. */
  muted?: boolean;
  /** Flip horizontally, like a mirror, for our own camera. */
  mirrored?: boolean;
  /** "contain" shows the whole picture (screen shares); "cover" fills the tile. */
  fit?: "cover" | "contain";
  /** Hide the picture but keep the sound playing (camera turned off). */
  hidden?: boolean;
  /** Changes when the user clicks "enable sound", to retry playback. */
  retryKey?: number;
  onAutoplayBlocked?: () => void;
};

/**
 * A <video> element playing live media. React has no prop for `srcObject`,
 * so it is assigned to the element directly in an effect.
 */
export function MediaPlayer({
  source,
  muted = false,
  mirrored = false,
  fit = "cover",
  hidden = false,
  retryKey = 0,
  onAutoplayBlocked,
}: MediaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reportBlocked = useEffectEvent(() => onAutoplayBlocked?.());

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = source instanceof MediaStreamTrack ? new MediaStream([source]) : source;
    if (!source) return;

    // Browsers refuse to play sound until the user has interacted with the
    // page (e.g. after a refresh). Report it so the room can ask for a click.
    video.play().catch((error: DOMException) => {
      if (error.name === "NotAllowedError") reportBlocked();
    });

    return () => {
      video.srcObject = null;
    };
  }, [source, retryKey]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className={cn(
        "absolute inset-0 size-full bg-room-tile",
        fit === "cover" ? "object-cover" : "object-contain",
        mirrored && "-scale-x-100",
        hidden && "invisible",
      )}
    />
  );
}
