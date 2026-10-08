import type { ReactNode } from "react";

/** Shared look for text inputs, selects and textareas (Zoom's web app: 40px tall, 12px corners). */
export const inputClassName =
  "h-10 w-full rounded-xl border border-field bg-white px-3.5 text-sm text-ink " +
  "placeholder:text-ink-muted transition-colors hover:border-[#9aa1ab] " +
  "focus:border-zoom-blue focus:outline-none focus:ring-2 focus:ring-zoom-blue/20";

type FieldProps = {
  label: string;
  /** The id of the control this label belongs to. */
  htmlFor: string;
  error?: string | null;
  children: ReactNode;
};

/** A labelled form row with room for a validation message. */
export function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm text-ink">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-[13px] text-zoom-red">
          {error}
        </p>
      )}
    </div>
  );
}
