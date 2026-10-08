"use client";

import {
  Ellipsis,
  Link2,
  type LucideIcon,
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  Smile,
  Users,
  Video,
  VideoOff,
} from "lucide-react";

import { Popover } from "@/components/ui/Popover";
import type { LocalMedia } from "@/hooks/useLocalMedia";
import { cn } from "@/lib/cn";

export type SidePanel = "participants" | "chat";

/** Must match ALLOWED_REACTIONS in backend/app/realtime/events.py. */
const REACTIONS = ["👏", "👍", "❤️", "😂", "😮", "🎉"];

const BUTTON_CLASS =
  "group relative flex h-14 w-12 flex-col items-center justify-center gap-1 rounded-lg " +
  "text-room-text transition-colors hover:bg-room-hover sm:w-[76px]";
const LABEL_CLASS = "hidden text-[11px] leading-none text-room-muted group-hover:text-room-text sm:block";

type ToolbarProps = {
  media: LocalMedia;
  isHost: boolean;
  participantCount: number;
  unreadMessages: number;
  activePanel: SidePanel | null;
  onTogglePanel: (panel: SidePanel) => void;
  onReact: (emoji: string) => void;
  onCopyInviteLink: () => void;
  onLeave: () => void;
  onEndForAll: () => void;
};

/** The control bar along the bottom of a Zoom meeting. */
export function Toolbar({
  media,
  isHost,
  participantCount,
  unreadMessages,
  activePanel,
  onTogglePanel,
  onReact,
  onCopyInviteLink,
  onLeave,
  onEndForAll,
}: ToolbarProps) {
  return (
    <footer className="flex h-[72px] shrink-0 items-center justify-between gap-1 bg-room-bar px-2 pb-[env(safe-area-inset-bottom)] sm:px-4">
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          label={media.audioOn ? "Mute" : "Unmute"}
          icon={media.audioOn ? Mic : MicOff}
          danger={!media.audioOn}
          onClick={media.toggleAudio}
        />
        <ToolbarButton
          label={media.videoOn ? "Stop video" : "Start video"}
          icon={media.videoOn ? Video : VideoOff}
          danger={!media.videoOn}
          onClick={media.toggleVideo}
        />
      </div>

      <div className="flex items-center gap-0.5">
        <ToolbarButton
          label="Participants"
          icon={Users}
          badge={participantCount}
          active={activePanel === "participants"}
          onClick={() => onTogglePanel("participants")}
        />
        <ToolbarButton
          label="Chat"
          icon={MessageSquare}
          badge={unreadMessages > 0 ? unreadMessages : undefined}
          badgeTone="alert"
          active={activePanel === "chat"}
          onClick={() => onTogglePanel("chat")}
        />
        {media.canShareScreen && (
          // On phones this moves into the "More" menu to save space.
          <div className="hidden sm:block">
            <ToolbarButton
              label={media.isSharingScreen ? "Stop share" : "Share"}
              icon={MonitorUp}
              highlight
              active={media.isSharingScreen}
              onClick={media.toggleScreenShare}
            />
          </div>
        )}

        <Popover
          label="Reactions"
          placement="top"
          triggerClassName={BUTTON_CLASS}
          trigger={
            <>
              <Smile size={22} />
              <span className={LABEL_CLASS}>React</span>
            </>
          }
        >
          {(close) => (
            <div className="flex gap-1 rounded-xl border border-room-line bg-room-bar p-1.5 shadow-popover">
              {REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  aria-label={`React with ${emoji}`}
                  onClick={() => {
                    onReact(emoji);
                    close();
                  }}
                  className="flex size-10 items-center justify-center rounded-lg text-2xl transition-transform hover:scale-125 hover:bg-room-hover"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </Popover>

        <Popover
          label="More"
          placement="top"
          align="end"
          triggerClassName={BUTTON_CLASS}
          trigger={
            <>
              <Ellipsis size={22} />
              <span className={LABEL_CLASS}>More</span>
            </>
          }
        >
          {(close) => (
            <div className="w-52 rounded-xl border border-room-line bg-room-bar py-1.5 text-sm text-room-text shadow-popover">
              <button
                type="button"
                onClick={() => {
                  onCopyInviteLink();
                  close();
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-left hover:bg-room-hover"
              >
                <Link2 size={16} />
                Copy invite link
              </button>
              {media.canShareScreen && (
                <button
                  type="button"
                  onClick={() => {
                    media.toggleScreenShare();
                    close();
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-left hover:bg-room-hover sm:hidden"
                >
                  <MonitorUp size={16} />
                  {media.isSharingScreen ? "Stop sharing" : "Share screen"}
                </button>
              )}
            </div>
          )}
        </Popover>
      </div>

      <Popover
        label={isHost ? "End meeting" : "Leave meeting"}
        placement="top"
        align="end"
        triggerClassName="h-9 rounded-lg bg-zoom-red px-4 text-sm font-bold text-white transition-colors hover:bg-zoom-red-hover"
        trigger={isHost ? "End" : "Leave"}
      >
        {() => (
          <div className="flex w-56 flex-col gap-2 rounded-xl border border-room-line bg-room-bar p-3 shadow-popover">
            {isHost && (
              <button
                type="button"
                onClick={onEndForAll}
                className="h-9 rounded-lg bg-zoom-red text-sm font-bold text-white hover:bg-zoom-red-hover"
              >
                End meeting for all
              </button>
            )}
            <button
              type="button"
              onClick={onLeave}
              className={cn(
                "h-9 rounded-lg text-sm font-bold",
                isHost
                  ? "bg-room-hover text-room-text hover:bg-room-line"
                  : "bg-zoom-red text-white hover:bg-zoom-red-hover",
              )}
            >
              Leave meeting
            </button>
          </div>
        )}
      </Popover>
    </footer>
  );
}

type ToolbarButtonProps = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  /** Draw the icon in red (microphone or camera switched off). */
  danger?: boolean;
  /** Draw the icon in green (Zoom's share button). */
  highlight?: boolean;
  /** The panel or feature this button controls is currently on. */
  active?: boolean;
  badge?: number;
  badgeTone?: "neutral" | "alert";
};

function ToolbarButton({
  label,
  icon: Icon,
  onClick,
  danger = false,
  highlight = false,
  active = false,
  badge,
  badgeTone = "neutral",
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(BUTTON_CLASS, active && "bg-room-hover")}
    >
      <Icon
        size={22}
        className={cn(danger && "text-zoom-red", highlight && "text-zoom-green")}
      />
      <span className={LABEL_CLASS}>{label}</span>
      {badge !== undefined && (
        <span
          className={cn(
            "absolute top-1 right-1 min-w-4 rounded-full px-1 text-center text-[10px] leading-4 font-bold sm:right-4",
            badgeTone === "alert" ? "bg-zoom-red text-white" : "bg-room-line text-room-text",
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
