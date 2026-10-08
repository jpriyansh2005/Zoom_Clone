"use client";

import {
  ChevronUp,
  Ellipsis,
  Heart,
  Link2,
  type LucideIcon,
  MessageSquare,
  Mic,
  MicOff,
  ShieldHalf,
  SquareArrowUp,
  UsersRound,
  Video,
} from "lucide-react";
import type { ReactNode } from "react";

import { Popover } from "@/components/ui/Popover";
import type { LocalMedia } from "@/hooks/useLocalMedia";
import { cn } from "@/lib/cn";

export type SidePanel = "participants" | "chat";

/** Must match ALLOWED_REACTIONS in backend/app/realtime/events.py. */
const REACTIONS = ["👏", "👍", "❤️", "😂", "😮", "🎉"];

const BUTTON_CLASS =
  "group relative flex h-[58px] w-12 flex-col items-center justify-center gap-1.5 rounded-lg " +
  "text-white transition-colors hover:bg-room-hover sm:w-[72px]";
const MENU_CLASS =
  "rounded-xl border border-room-line bg-[#1f2124] text-[13px] text-room-text shadow-popover";
const MENU_ITEM_CLASS = "flex w-full items-center gap-2.5 px-4 py-2 text-left hover:bg-room-hover";

type ToolbarProps = {
  media: LocalMedia;
  isHost: boolean;
  participantCount: number;
  unreadMessages: number;
  activePanel: SidePanel | null;
  onTogglePanel: (panel: SidePanel) => void;
  onReact: (emoji: string) => void;
  onCopyInviteLink: () => void;
  onMuteAll: () => void;
  onLeave: () => void;
  onEndForAll: () => void;
};

/**
 * The control bar along the bottom of a Zoom meeting: Audio and Video on
 * the left, the meeting tools in the middle, End on the right.
 */
export function Toolbar({
  media,
  isHost,
  participantCount,
  unreadMessages,
  activePanel,
  onTogglePanel,
  onReact,
  onCopyInviteLink,
  onMuteAll,
  onLeave,
  onEndForAll,
}: ToolbarProps) {
  return (
    <footer className="flex h-[70px] shrink-0 items-center justify-between gap-1 bg-room-bar px-2 pb-[env(safe-area-inset-bottom)] sm:px-4">
      <div className="flex items-center">
        <ToolbarButton
          label="Audio"
          actionLabel={media.audioOn ? "Mute" : "Unmute"}
          icon={Mic}
          slashed={!media.audioOn}
          hasCaret
          onClick={media.toggleAudio}
        />
        <ToolbarButton
          label="Video"
          actionLabel={media.videoOn ? "Stop video" : "Start video"}
          icon={Video}
          slashed={!media.videoOn}
          hasCaret
          onClick={media.toggleVideo}
        />
      </div>

      <div className="flex items-center">
        <ToolbarButton
          label="Participants"
          icon={UsersRound}
          count={participantCount}
          hasCaret
          active={activePanel === "participants"}
          onClick={() => onTogglePanel("participants")}
        />
        <ToolbarButton
          label="Chat"
          icon={MessageSquare}
          unread={unreadMessages}
          hasCaret
          active={activePanel === "chat"}
          onClick={() => onTogglePanel("chat")}
        />

        <Popover
          label="Reactions"
          placement="top"
          triggerClassName={BUTTON_CLASS}
          trigger={<ButtonFace label="React" icon={Heart} hasCaret />}
        >
          {(close) => (
            <div className={cn(MENU_CLASS, "flex gap-1 p-1.5")}>
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

        {media.canShareScreen && (
          // On phones Share and Host tools move into the "More" menu.
          <div className="hidden sm:block">
            <ToolbarButton
              label="Share"
              actionLabel={media.isSharingScreen ? "Stop share" : "Share"}
              icon={SquareArrowUp}
              hasCaret
              active={media.isSharingScreen}
              onClick={media.toggleScreenShare}
            />
          </div>
        )}

        {isHost && (
          <div className="hidden sm:block">
            <Popover
              label="Host tools"
              placement="top"
              triggerClassName={BUTTON_CLASS}
              trigger={<ButtonFace label="Host tools" icon={ShieldHalf} />}
            >
              {(close) => (
                <div className={cn(MENU_CLASS, "w-56 py-1.5")}>
                  <button
                    type="button"
                    onClick={() => {
                      onMuteAll();
                      close();
                    }}
                    className={MENU_ITEM_CLASS}
                  >
                    <MicOff size={16} />
                    Mute all participants
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onTogglePanel("participants");
                      close();
                    }}
                    className={MENU_ITEM_CLASS}
                  >
                    <UsersRound size={16} />
                    Manage participants
                  </button>
                </div>
              )}
            </Popover>
          </div>
        )}

        <Popover
          label="More"
          placement="top"
          align="end"
          triggerClassName={BUTTON_CLASS}
          trigger={<ButtonFace label="More" icon={Ellipsis} />}
        >
          {(close) => (
            <div className={cn(MENU_CLASS, "w-56 py-1.5")}>
              <button
                type="button"
                onClick={() => {
                  onCopyInviteLink();
                  close();
                }}
                className={MENU_ITEM_CLASS}
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
                  className={cn(MENU_ITEM_CLASS, "sm:hidden")}
                >
                  <SquareArrowUp size={16} />
                  {media.isSharingScreen ? "Stop sharing" : "Share screen"}
                </button>
              )}
              {isHost && (
                <button
                  type="button"
                  onClick={() => {
                    onMuteAll();
                    close();
                  }}
                  className={cn(MENU_ITEM_CLASS, "sm:hidden")}
                >
                  <MicOff size={16} />
                  Mute all participants
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
        triggerClassName={BUTTON_CLASS}
        trigger={
          <>
            <EndIcon />
            <span className="hidden text-[13px] leading-none text-room-muted sm:block">
              {isHost ? "End" : "Leave"}
            </span>
          </>
        }
      >
        {() => (
          <div className={cn(MENU_CLASS, "flex w-56 flex-col gap-2 p-3")}>
            {isHost && (
              <button
                type="button"
                onClick={onEndForAll}
                className="h-9 rounded-lg bg-zoom-red text-sm font-semibold text-white hover:bg-zoom-red-hover"
              >
                End meeting for all
              </button>
            )}
            <button
              type="button"
              onClick={onLeave}
              className={cn(
                "h-9 rounded-lg text-sm font-semibold",
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

type ButtonFaceProps = {
  label: string;
  icon: LucideIcon;
  /** Draw Zoom's red line through the icon (microphone or camera is off). */
  slashed?: boolean;
  /** The small arrow Zoom shows beside most toolbar icons. */
  hasCaret?: boolean;
  /** A number shown next to the icon, e.g. how many participants. */
  count?: number;
  /** Unread chat messages, shown as a red badge. */
  unread?: number;
};

/** What a toolbar button looks like: an icon with a label under it. */
function ButtonFace({ label, icon: Icon, slashed, hasCaret, count, unread = 0 }: ButtonFaceProps) {
  return (
    <>
      <span className="relative flex h-6 items-center gap-0.5">
        <span className="relative flex items-center justify-center">
          <Icon size={25} strokeWidth={1.5} />
          {slashed && (
            <span
              aria-hidden
              className="absolute h-[2px] w-[32px] -rotate-45 rounded-full bg-room-red"
            />
          )}
        </span>
        {count !== undefined && (
          <span className="text-[11px] leading-none font-semibold">{count}</span>
        )}
        {hasCaret && (
          <ChevronUp
            size={11}
            strokeWidth={2.2}
            aria-hidden
            className="hidden self-start text-room-faint sm:block"
          />
        )}
        {unread > 0 && (
          <span className="absolute -top-1.5 left-3.5 min-w-4 rounded-full bg-room-red px-1 text-center text-[10px] leading-4 font-semibold text-white">
            {unread}
          </span>
        )}
      </span>
      <span className="hidden text-[13px] leading-none text-room-muted sm:block">{label}</span>
    </>
  );
}

type ToolbarButtonProps = ButtonFaceProps & {
  onClick: () => void;
  /** What pressing the button does, for screen readers ("Mute"); defaults to the label. */
  actionLabel?: string;
  /** The panel or feature this button controls is currently on. */
  active?: boolean;
};

function ToolbarButton({ onClick, actionLabel, active = false, ...face }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={actionLabel ?? face.label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(BUTTON_CLASS, active && "bg-room-hover")}
    >
      <ButtonFace {...face} />
    </button>
  );
}

/** Zoom's End button: a red hexagon with a white cross. */
function EndIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-[26px]">
      <path
        d="M7.2 3.6h9.6L21.6 12l-4.8 8.4H7.2L2.4 12z"
        className="fill-none stroke-room-red"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path
        d="m9 9 6 6m0-6-6 6"
        className="stroke-white"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
