"use client";

import React, { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export type ResultStatus = "draft" | "saved" | "error" | "submitted";

export type ResultStudent = {
  id: string;
  name: string;
  admNo: string;
  test: number;
  exam: number;
  status: ResultStatus;
};

export type ResultContext = {
  classId: string;
  subjectId: string;
  sessionId: string;
  termId: string;
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
  if (total >= 40) return { grade: "E", remark: "Weak Pass", color: "text-rose-500" };
  return { grade: "F", remark: "Fail", color: "text-rose-700" };
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
    error: { label: "Error", cls: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
    submitted: { label: "Submitted", cls: "bg-slate-100 text-slate-700 border-slate-300", dot: "bg-slate-400" },
  };

  const v = map[status];

  return (
    <span className={["inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", v.cls].join(" ")}
    >
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
  const [busy, setBusy] = useState<"" | "save" | "submit">("");
  const canPersist = Boolean(
    ctx.classId && ctx.subjectId && ctx.sessionId && ctx.termId && students.length
  );

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const summary = useMemo(() => {
    const total = students.length;
    const changed = students.filter((s) => s.status === "draft").length;
    const errors = students.filter((s) => s.status === "error").length;
    const rowsToSubmit = students.filter((s) => s.status !== "submitted").length;
    return { total, changed, errors, rowsToSubmit };
  }, [students]);

  function updateScore(studentId: string, field: "test" | "exam", value: number) {
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

  function handleKeyNav(
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    field: "test" | "exam"
  ) {
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
    const ref =
      inputRefs.current[`${first.id}:test`] ?? inputRefs.current[`${first.id}:exam`];
    if (!ref) return;

    ref.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      ref.focus();
      ref.select();
    }, 250);
  }

  function saveDraft() {
    try {
      setBusy("save");
      const payload = {
        action: "save",
        classId: ctx.classId,
        subjectId: ctx.subjectId,
        sessionId: ctx.sessionId,
        termId: ctx.termId,
        students: students.map((s) => ({ id: s.id, test: s.test, exam: s.exam })),
      };
      fetch("/api/teacher/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error || "Failed to save results");
          setStudents((prev) =>
            prev.map((s) => (s.status === "draft" ? { ...s, status: "saved" } : s))
          );
          toast.success("Draft has been saved", { position: "top-right" });
        })
        .catch(() => {
          setStudents((prev) =>
            prev.map((s) => (s.status === "submitted" ? s : { ...s, status: "error" }))
          );
        })
        .finally(() => setBusy(""));
    } catch {
      setBusy("");
    }
  }

  function confirmSubmit() {
    if (summary.errors > 0) return;
    setBusy("submit");
    const payload = {
      action: "submit",
      classId: ctx.classId,
      subjectId: ctx.subjectId,
      sessionId: ctx.sessionId,
      termId: ctx.termId,
      students: students.map((s) => ({ id: s.id, test: s.test, exam: s.exam })),
    };
    fetch("/api/teacher/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to submit results");
        setStudents((prev) =>
          prev.map((s) => (s.status === "submitted" ? s : { ...s, status: "submitted" }))
        );
        setSubmitOpen(false);
        toast.success("Submitted successfully", { position: "top-right" });
      })
      .catch(() => {
        setStudents((prev) =>
          prev.map((s) => (s.status === "submitted" ? s : { ...s, status: "error" }))
        );
      })
      .finally(() => setBusy(""));
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Students
            </p>
            <CheckCircle2 className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {summary.total}
          </p>
          <p className="mt-2 text-xs text-slate-500">{ctx.totalStudentsLabel}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Draft Changes
            </p>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {summary.changed}
          </p>
          <p className="mt-2 text-xs text-slate-500">Awaiting save</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Errors</p>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {summary.errors}
          </p>
          <p className="mt-2 text-xs text-slate-500">Fix before submit</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-white/70">
              Last Saved
            </p>
            <Clock className="h-4 w-4 text-white/70" />
          </div>
          <p className="mt-3 text-3xl font-bold">{ctx.lastSavedLabel ?? "--"}</p>
          <p className="mt-2 text-xs text-white/70">Local time</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Enter Results</h3>
            <p className="text-sm text-slate-600 mt-1">
              <span className="font-medium">{ctx.className}</span> |{" "}
              <span className="font-medium">{ctx.subjectName}</span> |{" "}
              <span className="font-medium">{ctx.termLabel}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={saveDraft}
              disabled={busy !== "" || !canPersist}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-150 shadow-sm"
            >
              {busy === "save" ? "Saving..." : "Save Draft"}
            </button>

            <button
              type="button"
              onClick={() => setSubmitOpen(true)}
              disabled={busy !== "" || !canPersist}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all duration-150 shadow-sm"
            >
              Submit Results
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="sticky left-0 z-20 bg-slate-50 px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-200 min-w-70">
                  Student
                </th>

                <th className="px-4 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-200 w-28">
                  <div>Test</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    (Max: {ctx.maxTest})
                  </div>
                </th>

                <th className="px-4 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-200 w-28">
                  <div>Exam</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    (Max: {ctx.maxExam})
                  </div>
                </th>

                <th className="px-4 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-200 w-28 bg-slate-100">
                  <div>Total</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    (100)
                  </div>
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
                    ? "bg-rose-500"
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
                          <div className="font-medium text-slate-900 text-sm">
                            {s.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
                            {s.admNo}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 border-r border-slate-200 relative">
                      {rowDisabled ? (
                        <div className="text-center text-sm tabular-nums text-slate-600">
                          {s.test}
                        </div>
                      ) : (
                        <>
                          <input
                            ref={(el) => {
                              inputRefs.current[`${s.id}:test`] = el;
                            }}
                            type="number"
                            value={String(s.test ?? 0)}
                            onChange={(e) =>
                              updateScore(s.id, "test", clampToNumber(e.target.value))
                            }
                            onKeyDown={(e) => handleKeyNav(e, index, "test")}
                            className={[
                              "w-full px-2 py-2 text-center text-sm bg-transparent border rounded",
                              "focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900/30 tabular-nums",
                              testOk ? "border-slate-200" : "border-rose-500 bg-rose-50",
                            ].join(" ")}
                            min={0}
                            max={ctx.maxTest}
                            step={0.5}
                          />
                          {!testOk && (
                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-rose-600 font-medium whitespace-nowrap">
                              Max: {ctx.maxTest}
                            </div>
                          )}
                        </>
                      )}
                    </td>

                    <td className="px-4 py-4 border-r border-slate-200 relative">
                      {rowDisabled ? (
                        <div className="text-center text-sm tabular-nums text-slate-600">
                          {s.exam}
                        </div>
                      ) : (
                        <>
                          <input
                            ref={(el) => {
                              inputRefs.current[`${s.id}:exam`] = el;
                            }}
                            type="number"
                            value={String(s.exam ?? 0)}
                            onChange={(e) =>
                              updateScore(s.id, "exam", clampToNumber(e.target.value))
                            }
                            onKeyDown={(e) => handleKeyNav(e, index, "exam")}
                            className={[
                              "w-full px-2 py-2 text-center text-sm bg-transparent border rounded",
                              "focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900/30 tabular-nums",
                              examOk ? "border-slate-200" : "border-rose-500 bg-rose-50",
                            ].join(" ")}
                            min={0}
                            max={ctx.maxExam}
                            step={0.5}
                          />
                          {!examOk && (
                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-rose-600 font-medium whitespace-nowrap">
                              Max: {ctx.maxExam}
                            </div>
                          )}
                        </>
                      )}
                    </td>

                    <td className="px-4 py-4 border-r border-slate-200 bg-slate-50">
                      <div className="text-center text-sm font-semibold text-slate-900 tabular-nums">
                        {total}
                      </div>
                    </td>

                    <td className="px-4 py-4 border-r border-slate-200">
                      <div className={["text-center text-sm font-bold", gradeInfo.color].join(" ")}
                      >
                        {gradeInfo.grade}
                      </div>
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

        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Total Students:</span>
              <span className="font-semibold text-slate-900 tabular-nums">
                {summary.total}
              </span>
            </div>

            <div className="w-px h-4 bg-slate-300" />

            <div className="flex items-center gap-2">
              <span className="text-slate-600">Changed:</span>
              <span className="font-semibold text-amber-600 tabular-nums">
                {summary.changed}
              </span>
            </div>

            <div className="w-px h-4 bg-slate-300" />

            <div className="flex items-center gap-2">
              <span className="text-slate-600">Errors:</span>
              <span className="font-semibold text-rose-600 tabular-nums">
                {summary.errors}
              </span>
              <button
                type="button"
                onClick={jumpToFirstError}
                className="text-xs text-slate-900 hover:text-slate-700 font-medium underline ml-1"
              >
                Jump to first
              </button>
            </div>
          </div>
        </div>
      </div>

      {submitOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (busy === "submit") return;
            if (e.target === e.currentTarget) setSubmitOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                Confirm Submission
              </h2>
            </div>

            <div className="px-6 py-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
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
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {summary.rowsToSubmit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Errors to fix:</span>
                      <span className="font-semibold text-rose-600 tabular-nums">
                        {summary.errors}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {summary.errors > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                  <p className="text-xs text-rose-700 font-medium">
                    You must fix all errors before submitting. Please review the highlighted cells.
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setSubmitOpen(false)}
                disabled={busy === "submit"}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmSubmit}
                disabled={summary.errors > 0 || busy === "submit"}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {summary.errors > 0
                  ? "Fix Errors First"
                  : busy === "submit"
                    ? "Submitting..."
                    : "Submit Results"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
