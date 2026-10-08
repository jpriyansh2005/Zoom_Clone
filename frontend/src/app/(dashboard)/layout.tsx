import { DashboardProvider } from "@/components/dashboard/DashboardProvider";
import { TopNav } from "@/components/layout/TopNav";

/**
 * Shared frame for the signed-in pages (Home and Meetings). The folder name
 * is in brackets, so it groups these pages without adding to their URLs.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <TopNav />
      {/* Bottom padding keeps content clear of the tab bar on phones. */}
      <main className="mx-auto w-full max-w-[1120px] px-4 pt-6 pb-24 sm:px-6 md:pt-10 md:pb-12">
        {children}
      </main>
    </DashboardProvider>
  );
}
