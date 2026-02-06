"use client";

import { useEffect } from "react";

type ModalShellProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
};

const widthMap: Record<NonNullable<ModalShellProps["maxWidth"]>, string> = {
  sm: "max-w-xl",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
};

export function ModalShell({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "lg",
}: ModalShellProps) {
  // ESC + lock background scroll
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* Center */}
      <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
        <div
          className={[
            "w-full bg-white rounded-2xl shadow-2xl ring-1 ring-black/10 overflow-hidden flex flex-col",
            widthMap[maxWidth],
            // breathing room top/bottom
            "max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)]",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="px-5 sm:px-8 pt-6 pb-4 border-b border-gray-200 shrink-0 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {title}
              </h2>
              {subtitle ? (
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Body scrolls */}
          <div className="px-5 sm:px-8 py-5 overflow-y-auto flex-1">
            {children}
          </div>

          {/* Footer stays visible */}
          {footer ? (
            <div className="border-t border-gray-200 bg-white px-5 sm:px-8 py-4 shrink-0">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
