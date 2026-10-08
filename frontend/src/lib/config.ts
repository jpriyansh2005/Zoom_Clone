/** Where the FastAPI backend lives. Set NEXT_PUBLIC_API_URL when deploying. */
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export const API_BASE_URL = `${API_ORIGIN}/api/v1`;

/** Same host over WebSocket: http -> ws and https -> wss. */
export const WS_BASE_URL = API_ORIGIN.replace(/^http/, "ws");

/**
 * Servers that help two browsers find a direct route to each other.
 * Google's public STUN server is enough for most home and office networks.
 */
export const ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];
