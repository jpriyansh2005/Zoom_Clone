import type { Metadata } from "next";

import { PreJoin } from "@/components/meeting/BrowserOnly";

export const metadata: Metadata = { title: "Join meeting" };

/** The invite link: /j/86412345678 */
export default async function InviteLinkPage({ params }: PageProps<"/j/[code]">) {
  const { code } = await params;
  return <PreJoin code={code} />;
}
