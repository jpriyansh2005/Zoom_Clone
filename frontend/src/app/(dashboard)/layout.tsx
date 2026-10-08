import { DashboardProvider } from "@/components/dashboard/DashboardProvider";
import { ServerWakingNotice } from "@/components/dashboard/ServerWakingNotice";
import { AppShell } from "@/components/layout/AppShell";

/**
 * Shared frame for the signed-in pages (Home and Meetings). The folder name
 * is in brackets, so it groups these pages without adding to their URLs.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <AppShell>
        {/* Zoom keeps the page content in one narrow centred column. */}
        <div className="mx-auto w-full max-w-[552px] px-4 pb-10">
          <ServerWakingNotice />
          {children}
        </div>
      </AppShell>
    </DashboardProvider>
  );
}
