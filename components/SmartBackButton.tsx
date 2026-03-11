"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  fallbackHref: string;
  label?: string;
  sublabel?: string;
};

export default function SmartBackButton({
  fallbackHref,
  label = "Back",
  sublabel,
}: Props) {
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
      className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:bg-slate-50 sm:gap-3 sm:px-4 sm:py-2.5"
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 sm:h-8 sm:w-8">
        <ArrowLeft className="h-4 w-4" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        {sublabel ? <span className="hidden text-xs text-slate-500 md:block">{sublabel}</span> : null}
      </span>
    </button>
  );
}
