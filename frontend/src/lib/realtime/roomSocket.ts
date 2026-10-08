/** The WebSocket a browser keeps open while it is in a meeting. */

import { WS_BASE_URL } from "@/lib/config";
import type { ClientEvent, ServerEvent } from "@/lib/types";

/** Why the connection is over for good. */
export type CloseReason =
  | "invalid" // the session token was not accepted
  | "removed" // the host removed this participant
  | "replaced" // the same participant connected from another tab
  | "ended" // the host ended the meeting
  | "lost"; // the network dropped and reconnecting did not work

/** Close codes the server sends on purpose (see backend/app/realtime/rooms.py). */
const SERVER_CLOSE_REASONS: Record<number, CloseReason> = {
  4401: "invalid",
  4403: "removed",
  4409: "replaced",
  4410: "ended",
};

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_MS = 1000;

type RoomSocketOptions = {
  code: string;
  token: string;
  onEvent: (event: ServerEvent) => void;
  /** The connection dropped unexpectedly and a retry is on its way. */
  onReconnecting: () => void;
  onClosed: (reason: CloseReason) => void;
};

export class RoomSocket {
  private socket: WebSocket | null = null;
  private attempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  private closedByUs = false;

  constructor(private readonly options: RoomSocketOptions) {
    this.connect();
  }

  send(event: ClientEvent): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(event));
    }
  }

  /** Leave on purpose. No callbacks fire after this. */
  close(): void {
    this.closedByUs = true;
    clearTimeout(this.reconnectTimer);
    this.socket?.close();
  }

  private connect(): void {
    const { code, token } = this.options;
    const socket = new WebSocket(
      `${WS_BASE_URL}/ws/meetings/${code}?token=${encodeURIComponent(token)}`,
    );
    this.socket = socket;

    socket.onmessage = (message) => {
      // The server greets every connection with room_state, so any message
      // proves the connection works and the retry counter can start over.
      this.attempts = 0;
      this.options.onEvent(JSON.parse(message.data) as ServerEvent);
    };

    socket.onclose = (event) => {
      if (this.closedByUs) return;

      const serverReason = SERVER_CLOSE_REASONS[event.code];
      if (serverReason) {
        this.options.onClosed(serverReason);
        return;
      }
      if (this.attempts >= MAX_RECONNECT_ATTEMPTS) {
        this.options.onClosed("lost");
        return;
      }
      // Wait a little longer after each failed attempt.
      this.attempts += 1;
      this.options.onReconnecting();
      this.reconnectTimer = setTimeout(() => this.connect(), RECONNECT_DELAY_MS * this.attempts);
    };
  }
}
