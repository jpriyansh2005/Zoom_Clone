import type { Metadata, Viewport } from "next";

import { ToastProvider } from "@/components/ui/Toast";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Zoom Clone",
    template: "%s | Zoom Clone",
  },
  description: "A video conferencing app modelled on Zoom: start, join and schedule meetings.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#dfe2e7",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // No web font is loaded: like Zoom's web app, the page uses the system
  // font (see --font-sans in globals.css).
  return (
    <html lang="en" className="antialiased">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
