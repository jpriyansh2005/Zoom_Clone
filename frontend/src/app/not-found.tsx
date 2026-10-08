import type { Metadata } from "next";

import { RoomNotice } from "@/components/meeting/RoomNotice";

export const metadata: Metadata = { title: "Page not found" };

/** Shown by Next.js for any address that matches no route. */
export default function NotFound() {
  return (
    <RoomNotice
      title="Page not found"
      message="The page you are looking for doesn't exist or has moved."
    />
  );
}
