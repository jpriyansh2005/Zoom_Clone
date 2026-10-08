import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

/**
 * Styles follow the buttons in Zoom's web app: a solid blue primary, and a
 * pale grey secondary with blue text (its "Cancel" button).
 */
const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-zoom-blue text-white hover:bg-zoom-blue-hover",
  secondary: "bg-hover text-zoom-blue hover:bg-line",
  outline: "border border-[#939ba4] bg-white text-ink hover:bg-hover",
  danger: "bg-zoom-red text-white hover:bg-zoom-red-hover",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-7 rounded-lg px-3 text-[13px]",
  md: "h-8 rounded-xl px-4 text-sm",
  lg: "h-10 rounded-[10px] px-4 text-base",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 font-medium whitespace-nowrap transition-colors",
        // Zoom greys a disabled button out instead of fading its colour.
        "disabled:cursor-not-allowed disabled:bg-[#adb1b8]/25 disabled:text-ink-faint",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    />
  );
}
