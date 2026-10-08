"use client";

import { Copy, Ellipsis, Hash, Pencil, Trash2 } from "lucide-react";

import { DropdownMenu, type MenuItem } from "@/components/ui/DropdownMenu";
import { useToast } from "@/components/ui/Toast";
import { copyToClipboard } from "@/lib/invitation";
import { formatMeetingCode } from "@/lib/meetingCode";
import type { Meeting } from "@/lib/types";

import { useDashboard } from "./DashboardProvider";

/** The "..." menu on a meeting row. Items depend on the meeting's state. */
export function MeetingActionsMenu({ meeting }: { meeting: Meeting }) {
  const { copyInvitation, openScheduleDialog, openDeleteDialog } = useDashboard();
  const showToast = useToast();

  const canStillBeJoined = meeting.status !== "ended";
  const canBeEdited = meeting.kind === "scheduled" && meeting.status === "scheduled";

  const items: MenuItem[] = [];
  if (canStillBeJoined) {
    items.push({
      label: "Copy invitation",
      icon: <Copy size={16} />,
      onSelect: () => copyInvitation(meeting),
    });
  }
  items.push({
    label: "Copy meeting ID",
    icon: <Hash size={16} />,
    onSelect: async () => {
      const copied = await copyToClipboard(formatMeetingCode(meeting.code));
      showToast(copied ? "Meeting ID copied to clipboard" : "Couldn't copy the meeting ID");
    },
  });
  if (canBeEdited) {
    items.push({
      label: "Edit",
      icon: <Pencil size={16} />,
      onSelect: () => openScheduleDialog(meeting),
    });
  }
  if (meeting.status !== "live") {
    items.push({
      label: "Delete",
      icon: <Trash2 size={16} />,
      danger: true,
      onSelect: () => openDeleteDialog(meeting),
    });
  }

  return (
    <DropdownMenu
      label={`More actions for ${meeting.title}`}
      trigger={<Ellipsis size={18} />}
      triggerClassName="flex size-8 items-center justify-center rounded-lg text-ink-muted hover:bg-line/70 hover:text-ink"
      items={items}
    />
  );
}
