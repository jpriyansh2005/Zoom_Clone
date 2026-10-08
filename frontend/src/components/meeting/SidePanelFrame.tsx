import { X } from "lucide-react";
import type { ReactNode } from "react";

type SidePanelFrameProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * The white panel that slides in beside the videos (participants, chat).
 * On phones it covers the whole screen; from tablet size up it is a column.
 */
export function SidePanelFrame({ title, onClose, children, footer }: SidePanelFrameProps) {
  return (
    <aside
      aria-label={title}
      className="fixed inset-0 z-30 flex flex-col bg-white text-ink md:static md:z-auto md:w-[340px] md:shrink-0 md:rounded-xl"
    >
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-line pr-2 pl-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${title}`}
          className="flex size-8 items-center justify-center rounded-lg text-ink-muted hover:bg-hover"
        >
          <X size={18} />
        </button>
      </header>
      <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">{children}</div>
      {footer && <footer className="shrink-0 border-t border-line p-3">{footer}</footer>}
    </aside>
  );
}
