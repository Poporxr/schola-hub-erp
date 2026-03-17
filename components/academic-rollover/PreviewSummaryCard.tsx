"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { PreviewSummary } from "./types";

type Props = {
  preview: PreviewSummary | null;
  previewReady: boolean;
  onRunPreview: () => void;
  loading: boolean;
};

export default function PreviewSummaryCard({
  preview,
  previewReady,
  onRunPreview,
  loading,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">Preview Summary</h2>
          <p className="mt-1 text-sm text-slate-500">
            Run a dry preview to validate mappings and estimate rollout impact.
          </p>
        </div>
        <button
          type="button"
          onClick={onRunPreview}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generating..." : "Run Preview"}
        </button>
      </div>

      {!previewReady || !preview ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
          No preview generated yet. Configure mappings and click <span className="font-semibold">Run Preview</span>.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Metric label="Students" value={preview.studentsToMigrate} />
            <Metric label="Class Teachers" value={preview.classTeacherAssignmentsToCopy} />
            <Metric label="Subject Teachers" value={preview.subjectTeacherAssignmentsToCopy} />
            <Metric label="Class-Subject Links" value={preview.classSubjectLinksToCarry} />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                Warnings
              </p>
              {preview.warnings.length ? (
                <ul className="space-y-1 text-sm text-amber-700">
                  {preview.warnings.map((warning) => (
                    <li key={warning}>- {warning}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-amber-700">No warnings detected.</p>
              )}
            </div>

            <div
              className={[
                "rounded-xl p-4",
                preview.blockers.length
                  ? "border border-rose-200 bg-rose-50"
                  : "border border-emerald-200 bg-emerald-50",
              ].join(" ")}
            >
              <p
                className={[
                  "mb-2 flex items-center gap-2 text-sm font-semibold",
                  preview.blockers.length ? "text-rose-800" : "text-emerald-800",
                ].join(" ")}
              >
                {preview.blockers.length ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Blockers
              </p>
              {preview.blockers.length ? (
                <ul className="space-y-1 text-sm text-rose-700">
                  {preview.blockers.map((blocker) => (
                    <li key={blocker}>- {blocker}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-emerald-700">No blockers. You can proceed to execute.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
