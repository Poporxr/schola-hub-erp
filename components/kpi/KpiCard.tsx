import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type KpiTone = "default" | "soft" | "dark";

type KpiCardProps = {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  subtext?: ReactNode;
  footer?: ReactNode;
  tone?: KpiTone;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
};

const toneClasses: Record<KpiTone, string> = {
  default: "border border-slate-200 bg-white text-slate-900",
  soft: "border border-slate-200 bg-linear-to-br from-indigo-50 via-white to-white text-slate-900",
  dark: "border border-slate-200 bg-linear-to-r from-slate-900 to-slate-800 text-white",
};

const labelToneClasses: Record<KpiTone, string> = {
  default: "text-slate-500",
  soft: "text-slate-500",
  dark: "text-white/70",
};

const subtextToneClasses: Record<KpiTone, string> = {
  default: "text-slate-500",
  soft: "text-slate-500",
  dark: "text-white/70",
};

export default function KpiCard({
  label,
  value,
  icon,
  subtext,
  footer,
  tone = "default",
  className,
  valueClassName,
  labelClassName,
}: KpiCardProps) {
  return (
    <div className={cn("rounded-2xl p-3 shadow-sm sm:p-5", toneClasses[tone], className)}>
      <div className="flex items-center justify-between gap-2">
        <p
          className={cn(
            "truncate text-[10px] uppercase tracking-wide sm:text-xs",
            labelToneClasses[tone],
            labelClassName
          )}
        >
          {label}
        </p>
        {icon ? <span className="shrink-0">{icon}</span> : null}
      </div>

      <p className={cn("mt-1.5 text-xl font-bold sm:mt-3 sm:text-3xl", valueClassName)}>{value}</p>

      {subtext ? (
        <p className={cn("mt-1.5 text-[11px] sm:mt-2 sm:text-xs", subtextToneClasses[tone])}>
          {subtext}
        </p>
      ) : null}

      {footer ? <div className="mt-2 sm:mt-3">{footer}</div> : null}
    </div>
  );
}

