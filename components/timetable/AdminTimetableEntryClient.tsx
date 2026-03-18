"use client";

import { useState, useTransition } from "react";
import { UserCheck } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createTimetableEntryAction } from "@/components/actions/actions";

type SessionOption = { id: string; name: string; isCurrent: boolean };
type TermOption = { id: string; name: string; sessionId: string; isCurrent: boolean };
type ClassOption = { id: string; name: string };
type SubjectOption = { id: string; name: string; classIds: string[] };
type TeacherAssignmentOption = {
  teacherId: string;
  teacherName: string;
  classId: string;
  subjectId: string;
  sessionId: string;
  termId: string;
};

type Props = {
  sessions: SessionOption[];
  terms: TermOption[];
  classes: ClassOption[];
  subjects: SubjectOption[];
  teacherAssignments: TeacherAssignmentOption[];
  defaultSessionId: string;
  defaultTermId: string;
  dbError?: string;
};

const weekdays = ["MON", "TUE", "WED", "THU", "FRI"] as const;

const entrySchema = z
  .object({
    sessionId: z.string().min(1, "Session is required."),
    termId: z.string().min(1, "Term is required."),
    classId: z.string().min(1, "Class is required."),
    weekday: z.enum(weekdays, { error: "Weekday is required." }),
    subjectId: z.string().min(1, "Subject is required."),
    teacherId: z.string().min(1, "No teacher is assigned for the selected class and subject."),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Start time must be HH:MM."),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "End time must be HH:MM."),
    status: z.enum(["ACTIVE", "CANCELLED"]).default("ACTIVE"),
    notes: z.string().max(200, "Notes must be 200 characters or less.").optional().default(""),
  })
  .superRefine((value, ctx) => {
    if (value.startTime >= value.endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time must be later than start time.",
      });
    }
  });

type EntryForm = {
  sessionId: string;
  termId: string;
  classId: string;
  weekday: "MON" | "TUE" | "WED" | "THU" | "FRI";
  subjectId: string;
  startTime: string;
  endTime: string;
  notes: string;
  teacherId: string;
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100";

export default function AdminTimetableEntryClient({
  sessions,
  terms,
  classes,
  subjects,
  teacherAssignments,
  defaultSessionId,
  defaultTermId,
  dbError,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const defaultForm: EntryForm = {
    sessionId: defaultSessionId,
    termId: defaultTermId,
    classId: "",
    weekday: "MON",
    subjectId: "",
    startTime: "08:00",
    endTime: "08:40",
    notes: "",
    teacherId: "",
  };
  const [form, setForm] = useState<EntryForm>(defaultForm);

  const availableTerms = terms.filter((item) => item.sessionId === form.sessionId);
  const availableSubjects = subjects.filter((item) =>
    form.classId ? item.classIds.includes(form.classId) : true
  );
  const matchingTeachers = teacherAssignments.filter(
    (item) =>
      item.classId === form.classId &&
      item.subjectId === form.subjectId &&
      item.sessionId === form.sessionId &&
      item.termId === form.termId
  );
  const resolvedTeacher =
    matchingTeachers.length === 1
      ? matchingTeachers[0]
      : matchingTeachers.find((item) => item.teacherId === form.teacherId) ?? null;

  const onFieldChange = <K extends keyof EntryForm>(key: K, value: EntryForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSessionChange = (sessionId: string) => {
    const nextTerms = terms.filter((item) => item.sessionId === sessionId);
    setForm((prev) => ({
      ...prev,
      sessionId,
      termId: nextTerms.some((item) => item.id === prev.termId) ? prev.termId : nextTerms[0]?.id ?? "",
    }));
  };

  const onClassChange = (classId: string) => {
    const nextSubjects = subjects.filter((item) => item.classIds.includes(classId));
    const nextSubjectId = nextSubjects.some((item) => item.id === form.subjectId) ? form.subjectId : "";
    const nextTeachers = teacherAssignments.filter(
      (item) =>
        item.classId === classId &&
        item.sessionId === form.sessionId &&
        item.termId === form.termId &&
        (!nextSubjectId || item.subjectId === nextSubjectId)
    );
    const nextTeacherId =
      nextTeachers.length === 1
        ? nextTeachers[0].teacherId
        : nextTeachers.some((item) => item.teacherId === form.teacherId)
          ? form.teacherId
          : "";

    setForm((prev) => ({
      ...prev,
      classId,
      subjectId: nextSubjectId,
      teacherId: nextTeacherId,
    }));
  };

  const onSubjectChange = (subjectId: string) => {
    const nextTeachers = teacherAssignments.filter(
      (item) =>
        item.classId === form.classId &&
        item.subjectId === subjectId &&
        item.sessionId === form.sessionId &&
        item.termId === form.termId
    );
    setForm((prev) => ({
      ...prev,
      subjectId,
      teacherId: nextTeachers.length === 1 ? nextTeachers[0].teacherId : "",
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (dbError) {
      toast.error(dbError);
      return;
    }

    const payload = {
      ...form,
      teacherId: resolvedTeacher?.teacherId ?? form.teacherId ?? "",
      status: "ACTIVE" as const,
    };

    const parsed = entrySchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid timetable entry.");
      return;
    }

    const formData = new FormData();
    formData.set("sessionId", parsed.data.sessionId);
    formData.set("termId", parsed.data.termId);
    formData.set("classId", parsed.data.classId);
    formData.set("subjectId", parsed.data.subjectId);
    formData.set("teacherId", parsed.data.teacherId);
    formData.set("weekday", parsed.data.weekday);
    formData.set("startTime", parsed.data.startTime);
    formData.set("endTime", parsed.data.endTime);
    formData.set("notes", parsed.data.notes ?? "");

    startTransition(async () => {
      const result = await createTimetableEntryAction(formData);
      if (!result.ok) {
        toast.error(result.message ?? "Failed to create timetable entry.");
        return;
      }
      toast.success(result.message ?? "Timetable entry created.");
      router.push("/admin/timetable");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {dbError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {dbError}
        </div>
      ) : null}

      <header>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Timetable Entry</h1>
        <p className="mt-1 text-sm text-slate-600">
          Build weekly timetable slots with clean context, validated schedule details, and auto-resolved teachers.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Academic Context</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Session">
            <select
              value={form.sessionId}
              onChange={(event) => onSessionChange(event.target.value)}
              className={inputClass}
            >
              {sessions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Term">
            <select
              value={form.termId}
              onChange={(event) => onFieldChange("termId", event.target.value)}
              className={inputClass}
            >
              <option value="">Select term</option>
              {availableTerms.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Class">
            <select
              value={form.classId}
              onChange={(event) => onClassChange(event.target.value)}
              className={inputClass}
            >
              <option value="">Select class</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Weekday">
            <select
              value={form.weekday}
              onChange={(event) => onFieldChange("weekday", event.target.value as EntryForm["weekday"])}
              className={inputClass}
            >
              {weekdays.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section>
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Schedule Details</p>
            <h2 className="text-lg font-semibold text-slate-900">Create Entry</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Subject">
              <select
                value={form.subjectId}
                onChange={(event) => onSubjectChange(event.target.value)}
                className={inputClass}
              >
                <option value="">Select subject</option>
                {availableSubjects.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Start Time">
              <input
                type="time"
                value={form.startTime}
                onChange={(event) => onFieldChange("startTime", event.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="End Time">
              <input
                type="time"
                value={form.endTime}
                onChange={(event) => onFieldChange("endTime", event.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Notes (Optional)">
            <textarea
              value={form.notes}
              onChange={(event) => onFieldChange("notes", event.target.value)}
              rows={3}
              placeholder="Add any brief note for this entry."
              className={`${inputClass} resize-none`}
            />
          </Field>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned Teacher</p>
            {form.subjectId ? (
              resolvedTeacher ? (
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-800">
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium">{resolvedTeacher.teacherName}</span>
                  <span className="text-slate-500">from subject assignment</span>
                </div>
              ) : (
                <p className="mt-2 text-sm text-amber-700">
                  No teacher is assigned yet for the selected class and subject.
                </p>
              )
            ) : (
              <p className="mt-2 text-sm text-slate-500">Select a subject to resolve the assigned teacher.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending || Boolean(dbError)}
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Save Timetable Entry"}
          </button>
        </form>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
