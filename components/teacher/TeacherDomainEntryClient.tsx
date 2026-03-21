"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Save, Search, ShieldCheck } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { upsertTeacherDomainScoresAction } from "@/components/actions/actions";

type ScaleValue = 1 | 2 | 3 | 4 | 5 | null;

type StudentDomainRow = {
  studentId: string;
  admissionNumber: string;
  fullName: string;
  image: string | null;
  punctuality: ScaleValue;
  neatness: ScaleValue;
  politeness: ScaleValue;
  honesty: ScaleValue;
  relationshipWithOthers: ScaleValue;
  handwriting: ScaleValue;
  sportsAndGames: ScaleValue;
  drawingAndPainting: ScaleValue;
  musicalSkills: ScaleValue;
  verbalFluency: ScaleValue;
};

type Props = {
  sessionId: string;
  sessionName: string;
  termId: string;
  termName: string;
  classId: string;
  className: string;
  rows: StudentDomainRow[];
};

const scoreOptions: Array<{ value: ScaleValue; label: string }> = [
  { value: null, label: "-" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
];

function SelectCell({
  value,
  disabled,
  onChange,
}: {
  value: ScaleValue;
  disabled?: boolean;
  onChange: (value: ScaleValue) => void;
}) {
  return (
    <select
      value={value ?? ""}
      disabled={disabled}
      onChange={(event) => {
        const next = event.target.value;
        onChange(next ? (Number(next) as 1 | 2 | 3 | 4 | 5) : null);
      }}
      className="h-8 w-16 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
    >
      {scoreOptions.map((option) => (
        <option key={option.label} value={option.value ?? ""}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default function TeacherDomainEntryClient({
  sessionId,
  sessionName,
  termId,
  termName,
  classId,
  className,
  rows,
}: Props) {
  const [query, setQuery] = useState("");
  const [showAffective, setShowAffective] = useState(true);
  const [showPsychomotor, setShowPsychomotor] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [localRows, setLocalRows] = useState(rows);

  const rowsToRender = localRows.filter((row) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return true;
    return (
      row.fullName.toLowerCase().includes(normalizedQuery) ||
      row.admissionNumber.toLowerCase().includes(normalizedQuery)
    );
  });

  const studentsWithCompleteScores = localRows.filter((row) => {
    const affectiveComplete = Boolean(
      row.punctuality &&
        row.neatness &&
        row.politeness &&
        row.honesty &&
        row.relationshipWithOthers
    );
    const psychomotorComplete = Boolean(
      row.handwriting &&
        row.sportsAndGames &&
        row.drawingAndPainting &&
        row.musicalSkills &&
        row.verbalFluency
    );
    return affectiveComplete && psychomotorComplete;
  }).length;

  const editableStudents = localRows.length;

  const saveDisabled = isPending || !sessionId || !termId || !classId || !editableStudents;

  const updateField = (
    studentId: string,
    field: keyof Omit<StudentDomainRow, "studentId" | "admissionNumber" | "fullName" | "image">,
    value: ScaleValue
  ) => {
    setLocalRows((prev) =>
      prev.map((row) => (row.studentId === studentId ? { ...row, [field]: value } : row))
    );
  };

  const handleSave = () => {
    if (!sessionId || !termId || !classId) {
      toast.error("Session, term, and class are required.");
      return;
    }

    const payloadRows = localRows.map((row) => ({
      studentId: row.studentId,
      punctuality: row.punctuality,
      neatness: row.neatness,
      politeness: row.politeness,
      honesty: row.honesty,
      relationshipWithOthers: row.relationshipWithOthers,
      handwriting: row.handwriting,
      sportsAndGames: row.sportsAndGames,
      drawingAndPainting: row.drawingAndPainting,
      musicalSkills: row.musicalSkills,
      verbalFluency: row.verbalFluency,
    }));

    startTransition(async () => {
      const result = await upsertTeacherDomainScoresAction({
        classId,
        sessionId,
        termId,
        rows: payloadRows,
      });

      if (!result.ok) {
        toast.error(result.message ?? "Failed to save domain scores.");
        return;
      }
      toast.success(result.message ?? "Domain scores saved successfully.");
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Session
            </p>
            <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700">
              {sessionName}
            </div>
          </div>

          <div>
            <p className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Term
            </p>
            <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700">
              {termName}
            </div>
          </div>

          <div>
            <p className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Class
            </p>
            <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700">
              {className}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Students
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{localRows.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Completed
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{studentsWithCompleteScores}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Pending
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-700">
            {Math.max(localRows.length - studentsWithCompleteScores, 0)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-linear-to-r from-slate-900 to-slate-800 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
            Editable Rows
          </p>
          <p className="mt-2 text-2xl font-bold">{editableStudents}</p>
          <p className="text-xs text-white/70">Independent of subject result entries</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Enter Domain Scores</h2>
            <p className="text-sm text-slate-500">
              Scale: 1 = Poor, 2 = Fair, 3 = Good, 4 = Very Good, 5 = Excellent
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={showAffective}
                onChange={(event) => setShowAffective(event.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Affective
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={showPsychomotor}
                onChange={(event) => setShowPsychomotor(event.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Psychomotor
            </label>
            <button
              type="button"
              onClick={handleSave}
              disabled={saveDisabled}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isPending ? "Saving..." : "Save Scores"}
            </button>
          </div>
        </div>

        <div className="border-b border-slate-100 p-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search student by name or admission number"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="min-w-[1180px] w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2 font-semibold">Student</th>
                {showAffective ? (
                  <>
                    <th className="px-2 py-2 font-semibold">PUN</th>
                    <th className="px-2 py-2 font-semibold">NEA</th>
                    <th className="px-2 py-2 font-semibold">POL</th>
                    <th className="px-2 py-2 font-semibold">HON</th>
                    <th className="px-2 py-2 font-semibold">RWO</th>
                  </>
                ) : null}
                {showPsychomotor ? (
                  <>
                    <th className="px-2 py-2 font-semibold">HWR</th>
                    <th className="px-2 py-2 font-semibold">SPG</th>
                    <th className="px-2 py-2 font-semibold">DNP</th>
                    <th className="px-2 py-2 font-semibold">MUS</th>
                    <th className="px-2 py-2 font-semibold">VFL</th>
                  </>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {rowsToRender.map((row) => {
                const disabled = isPending;
                return (
                  <tr key={row.studentId} className="rounded-xl bg-slate-50/70">
                    <td className="rounded-l-xl border border-r-0 border-slate-200 bg-white px-3 py-2">
                      <div className="flex items-center gap-3">
                        <UserAvatar src={row.image ?? undefined} alt={row.fullName} size={36} className="h-9 w-9" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">{row.fullName}</p>
                          <p className="truncate text-xs text-slate-500">{row.admissionNumber}</p>
                        </div>
                      </div>
                    </td>
                    {showAffective ? (
                      <>
                        <td className="border-y border-slate-200 bg-white px-2 py-2">
                          <SelectCell value={row.punctuality} onChange={(value) => updateField(row.studentId, "punctuality", value)} disabled={disabled} />
                        </td>
                        <td className="border-y border-slate-200 bg-white px-2 py-2">
                          <SelectCell value={row.neatness} onChange={(value) => updateField(row.studentId, "neatness", value)} disabled={disabled} />
                        </td>
                        <td className="border-y border-slate-200 bg-white px-2 py-2">
                          <SelectCell value={row.politeness} onChange={(value) => updateField(row.studentId, "politeness", value)} disabled={disabled} />
                        </td>
                        <td className="border-y border-slate-200 bg-white px-2 py-2">
                          <SelectCell value={row.honesty} onChange={(value) => updateField(row.studentId, "honesty", value)} disabled={disabled} />
                        </td>
                        <td className="border-y border-slate-200 bg-white px-2 py-2">
                          <SelectCell value={row.relationshipWithOthers} onChange={(value) => updateField(row.studentId, "relationshipWithOthers", value)} disabled={disabled} />
                        </td>
                      </>
                    ) : null}
                    {showPsychomotor ? (
                      <>
                        <td className="border-y border-slate-200 bg-white px-2 py-2">
                          <SelectCell value={row.handwriting} onChange={(value) => updateField(row.studentId, "handwriting", value)} disabled={disabled} />
                        </td>
                        <td className="border-y border-slate-200 bg-white px-2 py-2">
                          <SelectCell value={row.sportsAndGames} onChange={(value) => updateField(row.studentId, "sportsAndGames", value)} disabled={disabled} />
                        </td>
                        <td className="border-y border-slate-200 bg-white px-2 py-2">
                          <SelectCell value={row.drawingAndPainting} onChange={(value) => updateField(row.studentId, "drawingAndPainting", value)} disabled={disabled} />
                        </td>
                        <td className="border-y border-slate-200 bg-white px-2 py-2">
                          <SelectCell value={row.musicalSkills} onChange={(value) => updateField(row.studentId, "musicalSkills", value)} disabled={disabled} />
                        </td>
                        <td className="rounded-r-xl border border-l-0 border-slate-200 bg-white px-2 py-2">
                          <SelectCell value={row.verbalFluency} onChange={(value) => updateField(row.studentId, "verbalFluency", value)} disabled={disabled} />
                        </td>
                      </>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Column Key
          </p>
          <div className="mt-2 grid gap-2 text-xs text-slate-600 sm:grid-cols-2 lg:grid-cols-5">
            <p><span className="font-semibold text-slate-800">PUN</span> = Punctuality</p>
            <p><span className="font-semibold text-slate-800">NEA</span> = Neatness</p>
            <p><span className="font-semibold text-slate-800">POL</span> = Politeness</p>
            <p><span className="font-semibold text-slate-800">HON</span> = Honesty</p>
            <p><span className="font-semibold text-slate-800">RWO</span> = Relationship with Others</p>
            <p><span className="font-semibold text-slate-800">HWR</span> = Handwriting</p>
            <p><span className="font-semibold text-slate-800">SPG</span> = Sports and Games</p>
            <p><span className="font-semibold text-slate-800">DNP</span> = Drawing and Painting</p>
            <p><span className="font-semibold text-slate-800">MUS</span> = Musical Skills</p>
            <p><span className="font-semibold text-slate-800">VFL</span> = Verbal Fluency</p>
          </div>
        </div>

        <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
            <span>Only class teachers can save entries for their assigned class/session/term.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
