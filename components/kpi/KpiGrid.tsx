import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type KpiGridProps = {
  children: ReactNode;
  className?: string;
};

export default function KpiGrid({ children, className }: KpiGridProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4", className)}>
      {children}
    </div>
  );
}

