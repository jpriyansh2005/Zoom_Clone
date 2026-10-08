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
import { usePathname, useRouter } from "next/navigation";
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
  "flex size-7 items-center justify-center rounded-md text-ink hover:bg-chrome-hover";

/**
 * The frame of Zoom Workplace: a grey top bar and navigation rail around a
 * white page. On phones the rail becomes a tab bar along the bottom.
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
          className="hidden w-[75px] shrink-0 flex-col items-center gap-1 px-1.5 pt-0.5 pb-3 md:flex"
        >
          <NavItems items={MAIN_ITEMS} onPlaceholder={placeholder} />
          <span aria-hidden className="my-1 h-px w-12 bg-[#c3c7cd]" />
          <NavItems items={EXTRA_ITEMS} onPlaceholder={placeholder} />
          <button
            type="button"
            aria-label="Settings"
            onClick={placeholder("Settings")}
            className={cn(BAR_BUTTON, "mt-auto")}
          >
            <Settings size={16} />
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
  const router = useRouter();
  const { user, startInstantMeeting, openJoinDialog, openScheduleDialog } = useDashboard();

  return (
    <header className="flex h-10 shrink-0 items-center gap-2 px-3 md:h-9 md:px-0">
      <Link href="/" aria-label="Zoom Workplace home" className="rounded-md md:w-[150px] md:pl-5">
        <ZoomLogo variant="stacked" />
      </Link>

      <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
        <button
          type="button"
          aria-label="Back"
          onClick={() => router.back()}
          className={cn(BAR_BUTTON, "hidden sm:flex")}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          aria-label="Forward"
          onClick={() => router.forward()}
          className={cn(BAR_BUTTON, "hidden sm:flex")}
        >
          <ChevronRight size={16} />
        </button>
        <button
          type="button"
          aria-label="History"
          onClick={onPlaceholder("History")}
          className={cn(BAR_BUTTON, "hidden sm:flex")}
        >
          <History size={15} />
        </button>

        <label className="relative mx-1 hidden h-[26px] min-w-0 flex-1 sm:block md:max-w-[392px]">
          <span className="sr-only">Search</span>
          <input
            type="search"
            placeholder=" "
            className="peer size-full rounded-lg bg-chrome-field px-3 text-center text-[12px] text-ink focus:bg-white focus:outline-none"
          />
          {/* Shown while the box is empty, centred like Zoom's search field. */}
          <span className="pointer-events-none absolute inset-0 hidden items-center justify-center gap-1.5 text-[12px] text-ink peer-placeholder-shown:flex peer-focus:hidden">
            <Search size={12} />
            Search (Ctrl+E)
          </span>
        </label>

        <DropdownMenu
          label="New"
          align="left"
          triggerClassName={BAR_BUTTON}
          trigger={<Plus size={16} />}
          items={[
            { label: "New meeting", onSelect: startInstantMeeting },
            { label: "Join a meeting", onSelect: openJoinDialog },
            { label: "Schedule a meeting", onSelect: () => openScheduleDialog() },
          ]}
        />
      </div>

      <div className="flex items-center justify-end gap-1.5 md:w-[150px] md:pr-3">
        <button
          type="button"
          aria-label="Notifications"
          onClick={onPlaceholder("Notifications")}
          className={cn(BAR_BUTTON, "relative")}
        >
          <Bell size={15} />
          <span className="absolute top-1 right-1 size-1.5 rounded-full bg-zoom-red" />
        </button>

        <DropdownMenu
          label="Profile menu"
          triggerClassName="block rounded-[28%]"
          trigger={<Avatar name={user?.name ?? "?"} size={24} />}
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
      "flex h-12 w-[63px] flex-col items-center justify-center gap-1 rounded-lg text-ink transition-colors",
      isActive ? "bg-white" : "hover:bg-chrome-hover",
    );
    const content = (
      <>
        <Icon size={17} strokeWidth={1.75} />
        <span className="text-[10px] leading-none">{label}</span>
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
