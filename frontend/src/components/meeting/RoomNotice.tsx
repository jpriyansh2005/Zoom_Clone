import Link from "next/link";
import type { ReactNode } from "react";

import { ZoomLogo } from "@/components/ui/ZoomLogo";

type RoomNoticeProps = {
  title: string;
  message?: string;
  /** Buttons or links under the message. Defaults to "Back to home". */
  actions?: ReactNode;
};

/**
 * A full-page message: meeting ended, invalid link, removed by host...
 * Laid out like Zoom's own "Join meeting" page: the wordmark in a thin
 * header, then a centred heading, text and a wide button.
 */
export function RoomNotice({ title, message, actions }: RoomNoticeProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <header className="flex h-16 shrink-0 items-center border-b border-line px-6 sm:px-11">
        <Link href="/" aria-label="Zoom home" className="rounded-md">
          <ZoomLogo variant="wordmark" />
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 pt-[18vh] text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        {message && <p className="mt-4 max-w-[480px] text-sm text-ink">{message}</p>}
        <div className="mt-10 flex w-full max-w-[400px] flex-col gap-4">
          {actions ?? (
            <Link
              href="/"
              className="flex h-12 items-center justify-center rounded-lg bg-zoom-blue text-base font-medium text-white hover:bg-zoom-blue-hover"
            >
              Back to home
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
