"use client";

import { useEffect, useEffectEvent, useState, useSyncExternalStore } from "react";

import { LocalDevices } from "@/lib/realtime/localDevices";
import type { MediaPreferences } from "@/lib/session";

export type LocalMedia = ReturnType<typeof useLocalMedia>;

/**
 * React's view of this browser's microphone, camera and screen share.
 * The devices themselves are managed by `LocalDevices`; this hook starts
 * them when the component appears, releases them when it goes away, and
 * re-renders whenever their state changes.
 */
export function useLocalMedia(initial: MediaPreferences) {
  const [devices] = useState(() => new LocalDevices());
  // useSyncExternalStore subscribes a component to state kept outside React.
  const state = useSyncExternalStore(devices.subscribe, devices.getState, devices.getState);

  const start = useEffectEvent(() => devices.start(initial));
  useEffect(() => {
    start();
    return () => devices.stop();
  }, [devices]);

  const videoOn = state.cameraTrack !== null;
  const isSharingScreen = state.screenTrack !== null;

  return {
    audioTrack: state.audioTrack,
    cameraTrack: state.cameraTrack,
    /** What other people see: the shared screen if sharing, else the camera. */
    outgoingVideoTrack: state.screenTrack ?? state.cameraTrack,
    audioOn: state.audioOn,
    videoOn,
    isSharingScreen,
    /** Phones cannot share their screen from a browser. */
    canShareScreen: Boolean(navigator.mediaDevices?.getDisplayMedia),
    error: state.error,
    clearError: () => devices.clearError(),
    toggleAudio: () => devices.setAudio(!state.audioOn),
    toggleVideo: () => devices.setVideo(!videoOn),
    toggleScreenShare: () =>
      isSharingScreen ? devices.stopScreenShare() : devices.startScreenShare(),
    turnAudioOff: () => devices.setAudio(false),
  };
}
