"use client";

import {
  Bell,
  Blocks,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Globe,
  History,
  House,
  LogOut,
  type LucideIcon,
  MessagesSquare,
  Plus,
  Search,
  Settings,
  UserRound,
  Video,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { Avatar } from "@/components/ui/Avatar";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { useToast } from "@/components/ui/Toast";
import { ZoomLogo } from "@/components/ui/ZoomLogo";
import { cn } from "@/lib/cn";

type NavItem = {
  label: string;
  icon: LucideIcon;
  /** Items without a link are placeholders for parts of Zoom outside this project. */
  href?: string;
};

const MAIN_ITEMS: NavItem[] = [
  { label: "Home", icon: House, href: "/" },
  { label: "Meetings", icon: Video, href: "/meetings" },
  { label: "Chat", icon: MessagesSquare },
  { label: "Scheduler", icon: CalendarClock },
  { label: "Hub", icon: Globe },
];
const EXTRA_ITEMS: NavItem[] = [
  { label: "Apps", icon: Blocks },
  { label: "More", icon: Ellipsis },
];

const BAR_BUTTON =
  "flex size-8 items-center justify-center rounded-md text-ink hover:bg-chrome-hover";

/**
 * The frame of Zoom Workplace: a grey top bar and navigation rail around a
 * white page. On phones the rail becomes a tab bar along the bottom.
 *
 * Sizes come from Zoom's own screenshot of its home tab, which was taken
 * at 175% display scaling: the top bar is 74 screen pixels tall there and
 * the rail 149 wide, which is 42px and 85px at normal scale.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const showToast = useToast();
  const placeholder = (feature: string) => () => showToast(`${feature} isn't part of this demo`);

  return (
    <div className="flex h-dvh flex-col bg-chrome">
      <TopBar onPlaceholder={placeholder} />

      <div className="flex min-h-0 flex-1">
        <nav
          aria-label="Main"
          className="hidden w-[85px] shrink-0 flex-col items-center gap-1 pt-0.5 pb-3 md:flex"
        >
          <NavItems items={MAIN_ITEMS} onPlaceholder={placeholder} />
          <span aria-hidden className="my-1 h-px w-14 bg-[#c3c7cd]" />
          <NavItems items={EXTRA_ITEMS} onPlaceholder={placeholder} />
          <button
            type="button"
            aria-label="Settings"
            onClick={placeholder("Settings")}
            className={cn(BAR_BUTTON, "mt-auto")}
          >
            <Settings size={18} />
          </button>
        </nav>

        <main className="thin-scrollbar min-w-0 flex-1 overflow-y-auto bg-white md:mr-1.5 md:rounded-t-xl">
          {children}
        </main>
      </div>

      <nav
        aria-label="Main"
        className="flex shrink-0 justify-around border-t border-[#c3c7cd] px-2 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] md:hidden"
      >
        <NavItems items={[...MAIN_ITEMS.slice(0, 3), EXTRA_ITEMS[1]]} onPlaceholder={placeholder} />
      </nav>
    </div>
  );
}

type PlaceholderFactory = (feature: string) => () => void;

function TopBar({ onPlaceholder }: { onPlaceholder: PlaceholderFactory }) {
  const { user } = useDashboard();

  return (
    <header className="flex h-11 shrink-0 items-center gap-2 px-3 md:h-[42px] md:px-0">
      <Link href="/" aria-label="Zoom Workplace home" className="rounded-md md:w-[170px] md:pl-[22px]">
        <ZoomLogo variant="stacked" />
      </Link>

      <TopBarCenter onPlaceholder={onPlaceholder} />

      <div className="flex items-center justify-end gap-2 md:w-[170px] md:pr-3.5">
        <button
          type="button"
          aria-label="Notifications"
          onClick={onPlaceholder("Notifications")}
          className={cn(BAR_BUTTON, "relative")}
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-zoom-red" />
        </button>

        <DropdownMenu
          label="Profile menu"
          triggerClassName="block rounded-[28%]"
          trigger={<Avatar name={user?.name ?? "?"} size={28} />}
          header={
            <div className="flex items-center gap-3">
              <Avatar name={user?.name ?? "?"} size={40} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user?.name ?? "Loading..."}</p>
                <p className="truncate text-[13px] text-ink-muted">{user?.email}</p>
              </div>
            </div>
          }
          items={[
            { label: "My profile", icon: <UserRound size={16} />, onSelect: onPlaceholder("Profile") },
            { label: "Settings", icon: <Settings size={16} />, onSelect: onPlaceholder("Settings") },
            { label: "Sign out", icon: <LogOut size={16} />, onSelect: onPlaceholder("Sign out") },
          ]}
        />
      </div>
    </header>
  );
}

/** Greyed-out look shared by the controls that are switched off. */
const SWITCHED_OFF = "hidden items-center text-ink/40 select-none sm:flex";

/**
 * The middle of the top bar. Zoom's back and forward arrows and its search
 * field have no job in this project, so they are drawn greyed out and
 * switched off: `inert` makes an element unclickable and skips it for the
 * keyboard and for screen readers. The "+" menu works: it offers the same
 * three actions as the tiles on the home screen.
 */
function TopBarCenter({ onPlaceholder }: { onPlaceholder: PlaceholderFactory }) {
  const { startInstantMeeting, openJoinDialog, openScheduleDialog } = useDashboard();

  return (
    <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
      <span inert className={cn(SWITCHED_OFF, "gap-3 px-1.5")}>
        <ChevronLeft size={18} />
        <ChevronRight size={18} />
      </span>
      <button
        type="button"
        aria-label="History"
        onClick={onPlaceholder("History")}
        className={cn(BAR_BUTTON, "hidden sm:flex")}
      >
        <History size={17} />
      </button>

      <span
        inert
        className={cn(
          SWITCHED_OFF,
          "mx-1 h-[29px] min-w-0 flex-1 justify-center gap-1.5 rounded-lg bg-chrome-field/60 text-[13px] md:max-w-[447px]",
        )}
      >
        <Search size={13} />
        Search (Ctrl+E)
      </span>

      <DropdownMenu
        label="New"
        align="left"
        triggerClassName={BAR_BUTTON}
        trigger={<Plus size={18} />}
        items={[
          { label: "New meeting", onSelect: startInstantMeeting },
          { label: "Join a meeting", onSelect: openJoinDialog },
          { label: "Schedule a meeting", onSelect: () => openScheduleDialog() },
        ]}
      />
    </div>
  );
}

function NavItems({
  items,
  onPlaceholder,
}: {
  items: NavItem[];
  onPlaceholder: PlaceholderFactory;
}) {
  const pathname = usePathname();

  return items.map(({ label, icon: Icon, href }) => {
    const isActive = href === pathname;
    const className = cn(
      "flex h-[55px] w-[72px] flex-col items-center justify-center gap-1.5 rounded-lg text-ink transition-colors",
      isActive ? "bg-white" : "hover:bg-chrome-hover",
    );
    const content = (
      <>
        <Icon size={19} strokeWidth={1.75} />
        <span className="text-[11px] leading-none">{label}</span>
      </>
    );

    return href ? (
      <Link key={label} href={href} aria-current={isActive ? "page" : undefined} className={className}>
        {content}
      </Link>
    ) : (
      <button key={label} type="button" onClick={onPlaceholder(label)} className={className}>
        {content}
      </button>
    );
  });
}
