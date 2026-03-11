"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type BackButtonProps = {
  label?: string;
  sublabel?: string;
  fallbackHref?: string;
  className?: string;
};

const BackButton = ({
  label = "Back",
  sublabel = "Return to previous page",
  fallbackHref = "/",
  className = "",
}: BackButtonProps) => {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`group inline-flex shrink-0 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:gap-3 sm:px-3.5 sm:py-2.5 ${className}`}
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-slate-900 group-hover:text-white sm:h-8 sm:w-8">
        <ArrowLeft className="h-4 w-4" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        {sublabel ? (
          <span className="hidden text-xs text-slate-500 md:block">{sublabel}</span>
        ) : null}
      </span>
    </button>
  );
};

export default BackButton;
