import Link from "next/link";
import type { ReactNode } from "react";

import { ZoomLogo } from "@/components/ui/ZoomLogo";

type RoomNoticeProps = {
  title: string;
  message?: string;
  /** Buttons or links under the message. Defaults to "Back to home". */
  actions?: ReactNode;
};

const HOME_LINK_CLASS =
  "inline-flex h-10 items-center rounded-[10px] bg-zoom-blue px-5 text-base font-medium text-white hover:bg-zoom-blue-hover";

/** A full-page message: meeting ended, invalid link, removed by host... */
export function RoomNotice({ title, message, actions }: RoomNoticeProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-[448px] rounded-[28px] bg-white px-8 py-10 text-center shadow-popover">
        <ZoomLogo className="mb-7" />
        <h1 className="text-xl font-bold">{title}</h1>
        {message && <p className="mt-2 text-sm text-ink-muted">{message}</p>}
        <div className="mt-7 flex justify-center gap-2">
          {actions ?? (
            <Link href="/" className={HOME_LINK_CLASS}>
              Back to home
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
