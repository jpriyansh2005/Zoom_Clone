import { cn } from "@/lib/cn";
import { avatarColor, initials } from "@/lib/person";

type AvatarProps = {
  name: string;
  /** Width and height in pixels. */
  size?: number;
  className?: string;
};

/** Zoom shows people without a photo as their initials on a rounded square. */
export function Avatar({ name, size = 36, className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[28%] font-bold text-white select-none",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        backgroundColor: avatarColor(name),
      }}
    >
      {initials(name)}
    </span>
  );
}
