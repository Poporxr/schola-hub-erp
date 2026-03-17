"use client";

import { ArrowRight, CircleAlert, CircleCheck } from "lucide-react";
import type { ClassOption, PromotionMapping } from "./types";

type Props = {
  mappings: PromotionMapping[];
  classes: ClassOption[];
  onMappingChange: (id: string, field: "fromClassId" | "toClassId", value: string) => void;
};

export default function PromotionMappingCard({ mappings, classes, onMappingChange }: Props) {
  const completedCount = mappings.filter((item) => item.fromClassId && item.toClassId).length;
  const sortedClasses = [...classes].sort((a, b) => {
    if (a.promotionTrack !== b.promotionTrack) return a.promotionTrack.localeCompare(b.promotionTrack);
    if (a.promotionRank !== b.promotionRank) return a.promotionRank - b.promotionRank;
    return a.name.localeCompare(b.name);
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
            Stage 3
          </div>
          <h2 className="mt-2 text-base font-semibold text-slate-900 sm:text-lg">Class Promotion Mapping</h2>
          <p className="mt-1 text-sm text-slate-500">
            Required mapping to prevent blind promotion during rollover.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          {completedCount}/{mappings.length} rows complete
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
        Each row defines a promotion path, e.g. <span className="font-semibold">JSS 1</span>{" "}
        <ArrowRight className="mx-1 inline h-3.5 w-3.5" /> <span className="font-semibold">JSS 2</span>.
      </div>

      <div className="space-y-3 md:hidden">
        {mappings.map((mapping) => {
          const complete = Boolean(mapping.fromClassId && mapping.toClassId);
          return (
            <div key={`${mapping.id}-mobile`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mapping {mapping.id}
                </p>
                <span
                  className={[
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    complete ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700",
                  ].join(" ")}
                >
                  {complete ? (
                    <CircleCheck className="h-3.5 w-3.5" />
                  ) : (
                    <CircleAlert className="h-3.5 w-3.5" />
                  )}
                  {complete ? "Complete" : "Incomplete"}
                </span>
              </div>
              <div className="space-y-2">
                <select
                  value={mapping.fromClassId}
                  onChange={(event) => onMappingChange(mapping.id, "fromClassId", event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">From Class</option>
                  {sortedClasses.map((item) => (
                    <option key={`from-${mapping.id}-${item.id}`} value={item.id}>
                      {formatClassOption(item)}
                    </option>
                  ))}
                </select>
                <select
                  value={mapping.toClassId}
                  onChange={(event) => onMappingChange(mapping.id, "toClassId", event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">To Class</option>
                  {sortedClasses.map((item) => (
                    <option key={`to-${mapping.id}-${item.id}`} value={item.id}>
                      {formatClassOption(item)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <th className="px-4 py-3">Row</th>
              <th className="px-4 py-3">From Class</th>
              <th className="px-4 py-3">To Class</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {mappings.map((mapping) => {
              const complete = Boolean(mapping.fromClassId && mapping.toClassId);
              return (
                <tr key={mapping.id}>
                  <td className="px-4 py-3 font-medium text-slate-700">{mapping.id}</td>
                  <td className="px-4 py-3">
                    <select
                      value={mapping.fromClassId}
                      onChange={(event) => onMappingChange(mapping.id, "fromClassId", event.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="">Select class</option>
                      {sortedClasses.map((item) => (
                        <option key={`from-desktop-${mapping.id}-${item.id}`} value={item.id}>
                          {formatClassOption(item)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={mapping.toClassId}
                      onChange={(event) => onMappingChange(mapping.id, "toClassId", event.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="">Select class</option>
                      {sortedClasses.map((item) => (
                        <option key={`to-desktop-${mapping.id}-${item.id}`} value={item.id}>
                          {formatClassOption(item)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={[
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                        complete ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700",
                      ].join(" ")}
                    >
                      {complete ? (
                        <CircleCheck className="h-3.5 w-3.5" />
                      ) : (
                        <CircleAlert className="h-3.5 w-3.5" />
                      )}
                      {complete ? "Complete" : "Incomplete"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatClassOption(item: ClassOption) {
  const terminal = item.isTerminal ? " | Terminal" : "";
  return `${item.name} (${item.promotionTrack} R${item.promotionRank}${terminal})`;
}
