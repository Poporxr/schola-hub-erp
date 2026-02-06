"use client";

import React, { useMemo, useRef, useState } from "react";

export type ResultStatus = "draft" | "saved" | "error" | "submitted";

export type ResultStudent = {
  id: number;
  name: string;
  admNo: string;
  test: number;
  exam: number;
  status: ResultStatus;
};

export type ResultContext = {
  className: string;
  subjectName: string;
  termLabel: string;
  totalStudentsLabel: string;
  lastSavedLabel?: string;
  maxTest: number;
  maxExam: number;
};

type GradeInfo = { grade: string; remark: string; color: string };

function calculateGrade(total: number): GradeInfo {
  if (total >= 90) return { grade: "A+", remark: "Excellent", color: "text-emerald-700" };
  if (total >= 80) return { grade: "A", remark: "Very Good", color: "text-emerald-600" };
  if (total >= 70) return { grade: "B", remark: "Good", color: "text-blue-600" };
  if (total >= 60) return { grade: "C", remark: "Fair", color: "text-amber-600" };
  if (total >= 50) return { grade: "D", remark: "Pass", color: "text-orange-600" };
  if (total >= 40) return { grade: "E", remark: "Weak Pass", color: "text-red-500" };
  return { grade: "F", remark: "Fail", color: "text-red-700" };
}

function validateInput(value: number, max: number) {
  if (Number.isNaN(value)) return false;
  if (value < 0) return false;
  if (value > max) return false;
  return true;
}

function clampToNumber(raw: string) {
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

function StatusBadge({ status }: { status: ResultStatus }) {
  const map: Record<ResultStatus, { label: string; cls: string; dot: string }> = {
    draft: { label: "Draft", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
    saved: { label: "Saved", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    error: { label: "Error", cls: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
    submitted: { label: "Submitted", cls: "bg-slate-100 text-slate-700 border-slate-300", dot: "bg-slate-400" },
  };

  const v = map[status];

  return (
    <span className={["inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", v.cls].join(" ")}>
      <span className={["w-1.5 h-1.5 rounded-full", v.dot].join(" ")} />
      {v.label}
    </span>
  );
}

export default function ResultsEntryClient({
  ctx,
  initialStudents,
}: {
  ctx: ResultContext;
  initialStudents: ResultStudent[];
}) {
  const [students, setStudents] = useState<ResultStudent[]>(() =>
    initialStudents.map((s) => {
      const testOk = validateInput(s.test, ctx.maxTest);
      const examOk = validateInput(s.exam, ctx.maxExam);
      if (!testOk || !examOk) return { ...s, status: "error" };
      return s;
    })
  );

  const [submitOpen, setSubmitOpen] = useState(false);

  // refs for keyboard navigation
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const summary = useMemo(() => {
    const total = students.length;
    const changed = students.filter((s) => s.status === "draft").length;
    const errors = students.filter((s) => s.status === "error").length;
    const rowsToSubmit = students.filter((s) => s.status !== "submitted").length;
    return { total, changed, errors, rowsToSubmit };
  }, [students]);

  function updateScore(studentId: number, field: "test" | "exam", value: number) {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        if (s.status === "submitted") return s;

        const next = { ...s, [field]: value } as ResultStudent;
        const testOk = validateInput(next.test, ctx.maxTest);
        const examOk = validateInput(next.exam, ctx.maxExam);

        next.status = !testOk || !examOk ? "error" : "draft";
        return next;
      })
    );
  }

  function focusNeighbor(rowIndex: number, field: "test" | "exam") {
    const row = students[rowIndex];
    if (!row) return;
    const key = `${row.id}:${field}`;
    const ref = inputRefs.current[key];
    if (ref && !ref.disabled) {
      ref.focus();
      ref.select();
    }
  }

  function handleKeyNav(e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, field: "test" | "exam") {
    const isTest = field === "test";

    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      focusNeighbor(rowIndex + 1, field);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      focusNeighbor(rowIndex - 1, field);
      return;
    }
    if (e.key === "ArrowRight" && isTest) {
      e.preventDefault();
      focusNeighbor(rowIndex, "exam");
      return;
    }
    if (e.key === "ArrowLeft" && !isTest) {
      e.preventDefault();
      focusNeighbor(rowIndex, "test");
      return;
    }
    if (e.key === "Escape") {
      setSubmitOpen(false);
    }
  }

  function jumpToFirstError() {
    const first = students.find((s) => s.status === "error");
    if (!first) return;
    const ref = inputRefs.current[`${first.id}:test`] ?? inputRefs.current[`${first.id}:exam`];
    if (!ref) return;

    ref.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      ref.focus();
      ref.select();
    }, 250);
  }

  function saveDraft() {
    // 🔁 Replace with server action later
    setStudents((prev) => prev.map((s) => (s.status === "draft" ? { ...s, status: "saved" } : s)));
  }

  function confirmSubmit() {
    if (summary.errors > 0) return;
    // 🔁 Replace with server action later
    setStudents((prev) => prev.map((s) => (s.status === "submitted" ? s : { ...s, status: "submitted" })));
    setSubmitOpen(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Enter Results</h3>
          <p className="text-sm text-slate-600 mt-1">
            <span className="font-medium">{ctx.className}</span> •{" "}
            <span className="font-medium">{ctx.subjectName}</span> •{" "}
            <span className="font-medium">{ctx.termLabel}</span> •{" "}
            <span className="font-medium">{ctx.totalStudentsLabel}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Last saved: <span className="font-medium text-slate-700">{ctx.lastSavedLabel ?? "--"}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={saveDraft}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-150 shadow-sm"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => setSubmitOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all duration-150 shadow-sm"
          >
            Submit Results
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="sticky left-0 z-20 bg-slate-50 px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-200 min-w-70">
                  Student
                </th>

                <th className="px-4 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-200 w-28">
                  <div>Test</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">(Max: {ctx.maxTest})</div>
                </th>

                <th className="px-4 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-200 w-28">
                  <div>Exam</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">(Max: {ctx.maxExam})</div>
                </th>

                <th className="px-4 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-200 w-28 bg-slate-100">
                  <div>Total</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">(100)</div>
                </th>

                <th className="px-4 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-200 w-24">
                  Grade
                </th>

                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-200 min-w-35">
                  Remark
                </th>

                <th className="px-4 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider w-32">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {students.map((s, index) => {
                const total = (s.test || 0) + (s.exam || 0);
                const gradeInfo = calculateGrade(total);

                const testOk = validateInput(s.test, ctx.maxTest);
                const examOk = validateInput(s.exam, ctx.maxExam);

                const rowDisabled = s.status === "submitted";

                const dot =
                  s.status === "error"
                    ? "bg-red-500"
                    : s.status === "draft"
                    ? "bg-amber-400"
                    : s.status === "saved"
                    ? "bg-emerald-500"
                    : "bg-slate-400";

                return (
                  <tr
                    key={s.id}
                    className={[
                      "hover:bg-slate-50 transition-colors duration-150",
                      s.status === "submitted" ? "bg-slate-50 text-slate-600" : "",
                    ].join(" ")}
                  >
                    <td
                      className={[
                        "sticky left-0 z-10 px-6 py-4 border-r border-slate-200",
                        s.status === "submitted" ? "bg-slate-50" : "bg-white",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3">
                        <div className={["w-2 h-2 rounded-full", dot].join(" ")} />
                        <div>
                          <div className="font-medium text-slate-900 text-sm">{s.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5 tabular-nums">{s.admNo}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 border-r border-slate-200 relative">
                      {rowDisabled ? (
                        <div className="text-center text-sm tabular-nums text-slate-600">{s.test}</div>
                      ) : (
                        <>
                          <input
                            ref={(el) => {
                              inputRefs.current[`${s.id}:test`] = el;
                            }}
                            type="number"
                            value={String(s.test ?? 0)}
                            onChange={(e) => updateScore(s.id, "test", clampToNumber(e.target.value))}
                            onKeyDown={(e) => handleKeyNav(e, index, "test")}
                            className={[
                              "w-full px-2 py-2 text-center text-sm bg-transparent border rounded",
                              "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 tabular-nums",
                              testOk ? "border-slate-200" : "border-red-500 bg-red-50",
                            ].join(" ")}
                            min={0}
                            max={ctx.maxTest}
                            step={0.5}
                          />
                          {!testOk && (
                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-red-600 font-medium whitespace-nowrap">
                              Max: {ctx.maxTest}
                            </div>
                          )}
                        </>
                      )}
                    </td>

                    <td className="px-4 py-4 border-r border-slate-200 relative">
                      {rowDisabled ? (
                        <div className="text-center text-sm tabular-nums text-slate-600">{s.exam}</div>
                      ) : (
                        <>
                          <input
                            ref={(el) => {
                              inputRefs.current[`${s.id}:exam`] = el;
                            }}
                            type="number"
                            value={String(s.exam ?? 0)}
                            onChange={(e) => updateScore(s.id, "exam", clampToNumber(e.target.value))}
                            onKeyDown={(e) => handleKeyNav(e, index, "exam")}
                            className={[
                              "w-full px-2 py-2 text-center text-sm bg-transparent border rounded",
                              "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 tabular-nums",
                              examOk ? "border-slate-200" : "border-red-500 bg-red-50",
                            ].join(" ")}
                            min={0}
                            max={ctx.maxExam}
                            step={0.5}
                          />
                          {!examOk && (
                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-red-600 font-medium whitespace-nowrap">
                              Max: {ctx.maxExam}
                            </div>
                          )}
                        </>
                      )}
                    </td>

                    <td className="px-4 py-4 border-r border-slate-200 bg-slate-50">
                      <div className="text-center text-sm font-semibold text-slate-900 tabular-nums">{total}</div>
                    </td>

                    <td className="px-4 py-4 border-r border-slate-200">
                      <div className={["text-center text-sm font-bold", gradeInfo.color].join(" ")}>{gradeInfo.grade}</div>
                    </td>

                    <td className="px-4 py-4 border-r border-slate-200">
                      <div className="text-sm text-slate-700">{gradeInfo.remark}</div>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={s.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Total Students:</span>
              <span className="font-semibold text-slate-900 tabular-nums">{summary.total}</span>
            </div>

            <div className="w-px h-4 bg-slate-300" />

            <div className="flex items-center gap-2">
              <span className="text-slate-600">Changed:</span>
              <span className="font-semibold text-amber-600 tabular-nums">{summary.changed}</span>
            </div>

            <div className="w-px h-4 bg-slate-300" />

            <div className="flex items-center gap-2">
              <span className="text-slate-600">Errors:</span>
              <span className="font-semibold text-red-600 tabular-nums">{summary.errors}</span>
              <button
                type="button"
                onClick={jumpToFirstError}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium underline ml-1"
              >
                Jump to first
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {submitOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSubmitOpen(false);
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Confirm Submission</h2>
            </div>

            <div className="px-6 py-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>

                <div className="flex-1">
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">
                    You are about to submit results for{" "}
                    <strong className="font-semibold text-slate-900">
                      {ctx.className} {ctx.subjectName}
                    </strong>
                    . Once submitted, you will not be able to edit these entries.
                  </p>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Rows to submit:</span>
                      <span className="font-semibold text-slate-900 tabular-nums">{summary.rowsToSubmit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Errors to fix:</span>
                      <span className="font-semibold text-red-600 tabular-nums">{summary.errors}</span>
                    </div>
                  </div>
                </div>
              </div>

              {summary.errors > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs text-red-700 font-medium">
                    ⚠️ You must fix all errors before submitting. Please review the highlighted cells.
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 rounded-b-xl">
              <button
                type="button"
                onClick={() => setSubmitOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmSubmit}
                disabled={summary.errors > 0}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {summary.errors > 0 ? "Fix Errors First" : "Submit Results"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
