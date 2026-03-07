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
        className="w-full max-w-[calc(100%-2rem)] border-none bg-transparent p-0 shadow-none sm:max-w-[calc(100%-3rem)]"
      >
        <div
          className={[
            "mx-auto w-full rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden flex flex-col",
            widthMap[maxWidth],
            "max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)]",
          ].join(" ")}
        >
          <div className="px-5 sm:px-8 pt-6 pb-4 border-b border-gray-200 shrink-0 flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                {title}
              </DialogTitle>
              {subtitle ? (
                <DialogDescription className="mt-1 text-sm text-gray-500">
                  {subtitle}
                </DialogDescription>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-5 sm:px-8 py-5 overflow-y-auto flex-1">
            {children}
          </div>

          {footer ? (
            <div className="border-t border-gray-200 bg-white px-5 sm:px-8 py-4 shrink-0">
              {footer}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
