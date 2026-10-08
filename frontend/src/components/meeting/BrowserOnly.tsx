"use client";

import dynamic from "next/dynamic";

/**
 * The meeting screens depend on things that exist only in a browser: the
 * camera, sessionStorage and WebSockets. `ssr: false` tells Next.js not to
 * render them on the server at all, so they can use those freely.
 */
const loading = () => <div className="h-dvh bg-room" />;

export const RoomGate = dynamic(() => import("./RoomGate").then((module) => module.RoomGate), {
  ssr: false,
  loading,
});

export const PreJoin = dynamic(() => import("./PreJoin").then((module) => module.PreJoin), {
  ssr: false,
  loading: () => <div className="h-dvh bg-canvas" />,
});
