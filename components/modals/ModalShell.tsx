"use client";

import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

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
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100vw-1rem)] border-none bg-transparent p-0 shadow-none sm:w-[calc(100vw-3rem)]"
      >
        <div
          className={[
            "mx-auto flex w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/10 sm:rounded-2xl",
            widthMap[maxWidth],
            "max-h-[92dvh] sm:max-h-[calc(100vh-3rem)]",
          ].join(" ")}
        >
          <div className="shrink-0 border-b border-gray-200 px-4 pt-4 pb-3 sm:px-8 sm:pt-6 sm:pb-4 flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900 sm:text-2xl">
                {title}
              </DialogTitle>
              {subtitle ? (
                <DialogDescription className="mt-1 text-xs text-gray-500 sm:text-sm">
                  {subtitle}
                </DialogDescription>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 sm:p-2"
              aria-label="Close modal"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-8 sm:py-5">
            {children}
          </div>

          {footer ? (
            <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3 sm:px-8 sm:py-4">
              {footer}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
