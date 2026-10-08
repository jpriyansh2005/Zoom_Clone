import { cn } from "@/lib/cn";

type ZoomLogoProps = {
  /**
   * "stacked" is the small two-line mark in the app's top bar.
   * "inline" is the coloured wordmark with "Workplace" beside it.
   * "wordmark" is the blue "zoom" alone, as on Zoom's join pages.
   */
  variant?: "stacked" | "inline" | "wordmark";
  className?: string;
};

/**
 * The "zoom Workplace" mark. The wordmark is drawn here with simple strokes
 * (a z, two circles and an m), so no image file from Zoom is needed.
 */
export function ZoomLogo({ variant = "inline", className }: ZoomLogoProps) {
  if (variant === "stacked") {
    return (
      <span
        className={cn("inline-flex flex-col items-start leading-none text-ink select-none", className)}
      >
        <Wordmark className="h-[9px]" />
        <span className="mt-[3px] text-[13px] leading-none font-bold tracking-tight">Workplace</span>
      </span>
    );
  }
  if (variant === "wordmark") {
    return <Wordmark className={cn("h-[26px] text-brand-blue", className)} />;
  }
  return (
    <span className={cn("inline-flex items-center gap-2 select-none", className)}>
      <Wordmark className="h-[22px] text-brand-blue" />
      <span className="text-[22px] leading-none font-semibold tracking-tight text-brand-navy">
        Workplace
      </span>
    </span>
  );
}

function Wordmark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 26"
      role="img"
      aria-label="zoom"
      fill="none"
      stroke="currentColor"
      strokeWidth="5.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-auto", className)}
    >
      <path d="M3.5 4.5h15.5L3.5 21.5h15.5" />
      <circle cx="35" cy="13" r="8.8" />
      <circle cx="58.5" cy="13" r="8.8" />
      <path d="M73.5 21.5v-10a5.6 5.6 0 0 1 11.2 0v10m0-10a5.6 5.6 0 0 1 11.2 0v10" />
    </svg>
  );
}
