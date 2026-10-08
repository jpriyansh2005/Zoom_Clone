import type { Metadata, Viewport } from "next";
import { Lato } from "next/font/google";

import { ToastProvider } from "@/components/ui/Toast";

import "./globals.css";

// Lato is the fallback in Zoom's own font stack, after its private typeface.
const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

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
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${lato.variable} antialiased`}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
