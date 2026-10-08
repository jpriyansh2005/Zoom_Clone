/**
 * This browser's microphone, camera and screen share.
 *
 * - Microphone: opened the first time it is unmuted, then muted by disabling
 *   the track. That makes unmuting instant.
 * - Camera: stopped completely when video is turned off, so the camera's
 *   indicator light goes out, and opened again when turned back on.
 * - Screen: replaces the camera picture for other people while sharing.
 *
 * Device tracks are browser objects that change on their own schedule, so
 * they live in this plain class rather than in React state. React reads a
 * snapshot through `subscribe` / `getState` (see hooks/useLocalMedia.ts).
 */

import type { MediaPreferences } from "@/lib/session";

type Device = "microphone" | "camera";

export type LocalDevicesState = {
  audioTrack: MediaStreamTrack | null;
  cameraTrack: MediaStreamTrack | null;
  screenTrack: MediaStreamTrack | null;
  /** True while the microphone is open and not muted. */
  audioOn: boolean;
  /** Why a device could not be opened, in words for the user. */
  error: string | null;
};

const INITIAL_STATE: LocalDevicesState = {
  audioTrack: null,
  cameraTrack: null,
  screenTrack: null,
  audioOn: false,
  error: null,
};

export class LocalDevices {
  private state = INITIAL_STATE;
  private readonly listeners = new Set<() => void>();
  /**
   * Goes up on every start and stop. Opening a device is asynchronous (the
   * browser may show a permission prompt); a request that finishes in a
   * later session than it started in is thrown away.
   */
  private session = 0;
  /** The tail of the queue of device requests; see `open`. */
  private requests: Promise<unknown> = Promise.resolve();

  // Arrow functions so React can call them without losing `this`.
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getState = (): LocalDevicesState => this.state;

  /** Open the devices the user chose before entering. */
  start(preferences: MediaPreferences): void {
    this.session += 1;
    if (preferences.audio) void this.setAudio(true);
    if (preferences.video) void this.setVideo(true);
  }

  /** Release every device, e.g. when leaving the meeting. */
  stop(): void {
    this.session += 1;
    const { audioTrack, cameraTrack, screenTrack } = this.state;
    for (const track of [audioTrack, cameraTrack, screenTrack]) {
      track?.stop();
    }
    this.update(INITIAL_STATE);
  }

  async setAudio(on: boolean): Promise<void> {
    if (!on) {
      if (this.state.audioTrack) this.state.audioTrack.enabled = false;
      this.update({ audioOn: false });
      return;
    }
    const track = this.state.audioTrack ?? (await this.open("microphone"));
    if (!track) return;
    track.enabled = true;
    this.update({ audioTrack: track, audioOn: true });
  }

  async setVideo(on: boolean): Promise<void> {
    if (!on) {
      this.state.cameraTrack?.stop();
      this.update({ cameraTrack: null });
      return;
    }
    if (this.state.cameraTrack) return;
    const track = await this.open("camera");
    if (track) this.update({ cameraTrack: track });
  }

  async startScreenShare(): Promise<void> {
    const session = this.session;
    let track: MediaStreamTrack;
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      [track] = stream.getVideoTracks();
    } catch {
      return; // the user closed the screen picker
    }
    if (session !== this.session) {
      track.stop();
      return;
    }
    // Fires when sharing is stopped from the browser's own "Stop sharing" bar.
    track.onended = () => this.forget(track);
    this.update({ screenTrack: track });
  }

  stopScreenShare(): void {
    this.state.screenTrack?.stop();
    this.update({ screenTrack: null });
  }

  clearError(): void {
    this.update({ error: null });
  }

  /**
   * Ask the browser for a device. Requests run one at a time, in order.
   *
   * By the time a queued request runs, the session it was made in may be
   * over, and then it is skipped without touching the device. This matters
   * in development, where React mounts every component twice: without the
   * queue the camera would be opened twice at the same moment.
   */
  private open(device: Device): Promise<MediaStreamTrack | null> {
    const session = this.session;
    const result = this.requests.then(() => this.request(device, session));
    this.requests = result;
    return result;
  }

  private async request(device: Device, session: number): Promise<MediaStreamTrack | null> {
    if (session !== this.session) return null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        device === "microphone" ? { audio: true } : { video: { width: 1280, height: 720 } },
      );
      const [track] = stream.getTracks();
      if (session !== this.session) {
        track.stop(); // the user left while the permission prompt was open
        return null;
      }
      // Fires if the device goes away by itself, e.g. a webcam is unplugged.
      track.onended = () => this.forget(track);
      return track;
    } catch (cause) {
      if (session === this.session) this.update({ error: describeError(cause, device) });
      return null;
    }
  }

  /** Drop a track that ended without us stopping it. */
  private forget(track: MediaStreamTrack): void {
    if (this.state.cameraTrack === track) this.update({ cameraTrack: null });
    if (this.state.screenTrack === track) this.update({ screenTrack: null });
    if (this.state.audioTrack === track) this.update({ audioTrack: null, audioOn: false });
  }

  /** Replace the state with a new object and tell React it changed. */
  private update(changes: Partial<LocalDevicesState>): void {
    this.state = { ...this.state, ...changes };
    this.listeners.forEach((listener) => listener());
  }
}

function describeError(cause: unknown, device: Device): string {
  const name = cause instanceof DOMException ? cause.name : "";
  if (name === "NotAllowedError") {
    return `Access to your ${device} is blocked. Allow it in your browser's site settings.`;
  }
  if (name === "NotFoundError") {
    return `No ${device} was found on this device.`;
  }
  if (name === "NotReadableError") {
    return `Your ${device} is being used by another app.`;
  }
  return `Couldn't start your ${device}.`;
}
