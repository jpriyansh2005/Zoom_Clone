"use client";

import { Check, Copy, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Popover } from "@/components/ui/Popover";
import { useNow } from "@/hooks/useNow";
import type { RoomStatus } from "@/hooks/useMeetingRoom";
import { formatElapsed } from "@/lib/datetime";
import { copyToClipboard } from "@/lib/invitation";
import { formatMeetingCode } from "@/lib/meetingCode";
import type { Meeting } from "@/lib/types";

type MeetingHeaderProps = {
  meeting: Meeting;
  status: RoomStatus;
};

/** The strip above the videos: meeting info on the left, timer on the right. */
export function MeetingHeader({ meeting, status }: MeetingHeaderProps) {
  return (
    <header className="flex h-11 shrink-0 items-center justify-between gap-3 px-3 text-room-text">
      <div className="flex min-w-0 items-center gap-2">
        <Popover
          label="Meeting information"
          align="start"
          triggerClassName="flex size-7 items-center justify-center rounded-md text-zoom-green hover:bg-room-hover"
          trigger={<ShieldCheck size={19} />}
        >
          {() => <MeetingInfoCard meeting={meeting} />}
        </Popover>
        <p className="truncate text-sm font-bold">{meeting.title}</p>
      </div>

      <div className="flex shrink-0 items-center gap-3 text-[13px] text-room-muted">
        {status === "reconnecting" && <span className="text-zoom-orange">Reconnecting...</span>}
        {status === "connecting" && <span>Connecting...</span>}
        <ElapsedTime since={meeting.started_at} />
      </div>
    </header>
  );
}

function ElapsedTime({ since }: { since: string | null }) {
  const now = useNow();
  if (!now || !since) return null;
  const seconds = Math.max(0, Math.floor((now.getTime() - new Date(since).getTime()) / 1000));
  return <span className="tabular-nums">{formatElapsed(seconds)}</span>;
}

/** Zoom's green-shield popover: topic, host, meeting ID and invite link. */
function MeetingInfoCard({ meeting }: { meeting: Meeting }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    if (await copyToClipboard(meeting.join_url)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="w-[min(340px,calc(100vw-1.5rem))] rounded-xl bg-white p-4 text-ink shadow-popover">
      <h2 className="mb-3 text-[15px] font-bold">{meeting.title}</h2>
      <dl className="grid grid-cols-[84px_1fr] gap-x-3 gap-y-2 text-[13px]">
        <dt className="text-ink-muted">Meeting ID</dt>
        <dd className="font-bold">{formatMeetingCode(meeting.code)}</dd>
        <dt className="text-ink-muted">Host</dt>
        <dd>{meeting.host.name}</dd>
        <dt className="text-ink-muted">Invite link</dt>
        <dd className="min-w-0 break-all text-zoom-blue">{meeting.join_url}</dd>
      </dl>
      <button
        type="button"
        onClick={copyLink}
        className="mt-3 flex items-center gap-1.5 text-[13px] font-bold text-zoom-blue hover:underline"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
