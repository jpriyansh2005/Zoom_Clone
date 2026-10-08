"use client";

import {
  Contact,
  House,
  LogOut,
  type LucideIcon,
  MessageCircle,
  Search,
  Settings,
  UserRound,
  Video,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { Avatar } from "@/components/ui/Avatar";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { useToast } from "@/components/ui/Toast";
import { ZoomLogo } from "@/components/ui/ZoomLogo";
import { cn } from "@/lib/cn";

type Tab = {
  label: string;
  icon: LucideIcon;
  /** Tabs without a link are placeholders for parts of Zoom outside this project. */
  href?: string;
};

const TABS: Tab[] = [
  { label: "Home", icon: House, href: "/" },
  { label: "Meetings", icon: Video, href: "/meetings" },
  { label: "Team Chat", icon: MessageCircle },
  { label: "Contacts", icon: Contact },
];

/** Zoom's header: logo, tabs, search, settings and the profile menu. */
export function TopNav() {
  const { user } = useDashboard();
  const showToast = useToast();
  const placeholder = (feature: string) => () => showToast(`${feature} isn't part of this demo`);

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-line bg-white px-4 sm:px-6">
        <Link href="/" aria-label="Zoom home" className="shrink-0 rounded-md">
          <ZoomLogo withProduct />
        </Link>

        <nav aria-label="Main" className="mx-auto hidden items-center gap-1 md:flex">
          <Tabs onPlaceholder={placeholder} />
        </nav>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <label className="relative hidden lg:block">
            <Search
              size={15}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted"
            />
            <input
              type="search"
              placeholder="Search"
              aria-label="Search"
              className="h-9 w-44 rounded-lg bg-canvas pr-3 pl-9 text-sm placeholder:text-ink-muted focus:ring-2 focus:ring-zoom-blue/30 focus:outline-none"
            />
          </label>

          <button
            type="button"
            aria-label="Settings"
            onClick={placeholder("Settings")}
            className="flex size-9 items-center justify-center rounded-lg text-ink-muted hover:bg-hover hover:text-ink"
          >
            <Settings size={19} />
          </button>

          <DropdownMenu
            label="Profile menu"
            triggerClassName="relative ml-1 block rounded-[28%]"
            trigger={
              <>
                <Avatar name={user?.name ?? "?"} size={36} />
                <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-white bg-zoom-green" />
              </>
            }
            header={
              <div className="flex items-center gap-3">
                <Avatar name={user?.name ?? "?"} size={40} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{user?.name ?? "Loading..."}</p>
                  <p className="truncate text-[13px] text-ink-muted">{user?.email}</p>
                </div>
              </div>
            }
            items={[
              { label: "My profile", icon: <UserRound size={16} />, onSelect: placeholder("Profile") },
              { label: "Settings", icon: <Settings size={16} />, onSelect: placeholder("Settings") },
              { label: "Sign out", icon: <LogOut size={16} />, onSelect: placeholder("Sign out") },
            ]}
          />
        </div>
      </header>

      {/* On phones the tabs move to a bar at the bottom, as in Zoom's mobile app. */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-line bg-white pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] md:hidden"
      >
        <Tabs onPlaceholder={placeholder} />
      </nav>
    </>
  );
}

function Tabs({ onPlaceholder }: { onPlaceholder: (feature: string) => () => void }) {
  const pathname = usePathname();

  return TABS.map(({ label, icon: Icon, href }) => {
    const isActive = href === pathname;
    const content = (
      <>
        <span
          className={cn(
            "flex h-7 w-12 items-center justify-center rounded-lg transition-colors",
            isActive ? "bg-zoom-blue-soft" : "group-hover:bg-hover",
          )}
        >
          <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
        </span>
        <span className="text-[11px] leading-none font-bold">{label}</span>
      </>
    );
    const className = cn(
      "group flex w-[72px] flex-col items-center gap-1 rounded-lg py-1",
      isActive ? "text-zoom-blue" : "text-ink-muted hover:text-ink",
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
