"use client";

import { useEffect } from "react";

export default function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 rounded-full border-[3px] border-blue-200 border-t-blue-500 animate-spin" />
        <p className="text-gray-700 font-medium text-lg">{message}</p>

        <div className="flex gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse [animation-delay:200ms]" />
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse [animation-delay:400ms]" />
        </div>
      </div>
    </div>
  );
}