import { cn } from "@/lib/cn";

type ZoomLogoProps = {
  /** Show the smaller "Workplace" word next to the wordmark. */
  withProduct?: boolean;
  className?: string;
};

/** The "zoom" wordmark, drawn with text so no image asset is needed. */
export function ZoomLogo({ withProduct = false, className }: ZoomLogoProps) {
  return (
    <span className={cn("inline-flex items-baseline gap-1.5 select-none", className)}>
      <span className="text-[26px] leading-none font-black tracking-[-0.06em] text-zoom-blue">
        zoom
      </span>
      {withProduct && (
        <span className="text-[15px] leading-none font-bold text-zoom-blue">Workplace</span>
      )}
    </span>
  );
}
