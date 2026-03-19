"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Layers3,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import PromotionMappingCard from "./PromotionMappingCard";
import type { ClassOption, PromotionMapping, SessionOption } from "./types";
import {
  executeAcademicRolloverAction,
  previewAcademicRolloverAction,
  type RolloverPreviewResult,
} from "@/components/actions/rollover-actions";

const expectedConfirmationText = "EXECUTE ROLLOVER";
const termTypeOptions = ["FIRST", "SECOND", "THIRD"] as const;

type Props = {
  initialSessions: SessionOption[];
  initialClasses: ClassOption[];
  currentSession: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  } | null;
};

type PreviewSummary = NonNullable<RolloverPreviewResult["summary"]>;

const emptyPreviewSummary: PreviewSummary = {
  sessionsToCreate: 0,
  termsToCreate: 0,
  studentsToPromote: 0,
  mappedClasses: 0,
  warnings: [],
  blockers: [],
};

function buildInitialMappings(
  classes: ClassOption[],
  mode: "session_term" | "term_only"
): PromotionMapping[] {
  const sourceClasses =
    mode === "term_only" ? classes : classes.filter((item) => !item.isTerminal);

  const orderedClasses = sourceClasses
    .sort((a, b) => {
      if (a.promotionTrack !== b.promotionTrack) {
        return a.promotionTrack.localeCompare(b.promotionTrack);
      }
      if (a.promotionRank !== b.promotionRank) {
        return a.promotionRank - b.promotionRank;
      }
      return a.name.localeCompare(b.name);
    });

  if (!orderedClasses.length) {
    return [{ id: "M01", fromClassId: "", toClassId: "" }];
  }

  return orderedClasses.map((fromClass, index) => {
    if (mode === "term_only") {
      return {
        id: `M${String(index + 1).padStart(2, "0")}`,
        fromClassId: fromClass.id,
        toClassId: fromClass.id,
      };
    }

    const suggestedTarget = classes.find(
      (candidate) =>
        candidate.promotionTrack === fromClass.promotionTrack &&
        candidate.promotionRank === fromClass.promotionRank + 1
    );

    return {
      id: `M${String(index + 1).padStart(2, "0")}`,
      fromClassId: fromClass.id,
      toClassId: suggestedTarget?.id ?? "",
    };
  });
}

export default function AcademicRolloverClient({
  initialSessions,
  initialClasses,
  currentSession,
}: Props) {
  const router = useRouter();
  const [rolloverMode, setRolloverMode] = useState<"session_term" | "term_only">(
    currentSession ? "term_only" : "session_term"
  );

  const [targetSessionId, setTargetSessionId] = useState("new");
  const [sessionName, setSessionName] = useState("");
  const [sessionStartDate, setSessionStartDate] = useState("");
  const [sessionEndDate, setSessionEndDate] = useState("");
  const [sessionCurrent, setSessionCurrent] = useState(true);

  const [termName, setTermName] = useState("First Term");
  const [termType, setTermType] = useState<(typeof termTypeOptions)[number]>("FIRST");
  const [termStartDate, setTermStartDate] = useState("");
  const [termEndDate, setTermEndDate] = useState("");
  const [termCurrent, setTermCurrent] = useState(true);

  const [promoteStudents, setPromoteStudents] = useState(true);
  const [carryTeacherAssignments, setCarryTeacherAssignments] = useState(true);
  const [mappings, setMappings] = useState<PromotionMapping[]>(
    buildInitialMappings(initialClasses, currentSession ? "term_only" : "session_term")
  );

  const [preview, setPreview] = useState<PreviewSummary | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [executing, setExecuting] = useState(false);

  function setMode(mode: "session_term" | "term_only") {
    setRolloverMode(mode);
    setMappings(buildInitialMappings(initialClasses, mode));
    if (mode === "term_only" && currentSession) {
      setTargetSessionId(currentSession.id);
      setSessionCurrent(true);
    }
    setPreview(null);
    setConfirmationText("");
  }

  function handleMappingChange(id: string, field: "fromClassId" | "toClassId", value: string) {
    setMappings((prev) =>
      prev.map((mapping) => (mapping.id === id ? { ...mapping, [field]: value } : mapping))
    );
  }

  function buildPayload() {
    const effectiveTargetSessionId =
      rolloverMode === "term_only" && currentSession ? currentSession.id : targetSessionId;

    return {
      targetSessionId: effectiveTargetSessionId,
      sessionName,
      sessionStartDate,
      sessionEndDate,
      sessionCurrent,
      termName,
      termType,
      termStartDate,
      termEndDate,
      termCurrent,
      promoteStudents,
      carryTeacherAssignments,
      mappings,
    };
  }

  async function runPreview() {
    if (rolloverMode === "term_only" && !currentSession) {
      toast.error("No current session found. Use Session + Term mode instead.");
      return;
    }
    setPreviewLoading(true);
    const result = await previewAcademicRolloverAction(buildPayload());
    setPreviewLoading(false);

    if (!result.ok || !result.summary) {
      toast.error(result.message ?? "Unable to generate rollover preview.");
      setPreview(emptyPreviewSummary);
      return;
    }

    setPreview(result.summary);
    if (result.summary.blockers.length) {
      toast.warning("Preview generated with blockers.");
      return;
    }
    toast.success("Preview generated successfully.");
  }

  const canExecute =
    Boolean(preview) &&
    (preview?.blockers.length ?? 0) === 0 &&
    confirmationText.trim() === expectedConfirmationText;

  async function handleExecute() {
    if (!canExecute) return;
    setExecuting(true);
    const result = await executeAcademicRolloverAction(buildPayload());
    setExecuting(false);

    if (!result.ok) {
      toast.error(result.message ?? "Failed to execute academic rollover.");
      return;
    }

    setConfirmationText("");
    toast.success(result.message ?? "Academic rollover executed.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-indigo-100 blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-36 w-36 rounded-full bg-rose-100/70 blur-3xl" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-rose-700">
              <ShieldAlert className="h-3.5 w-3.5" />
              Sensitive Operation
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Admin Only
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Academic Rollover Console</h1>
            <p className="max-w-3xl text-sm text-slate-600">
              Structured progression workflow for creating the next session/term, validating class
              mappings, and executing rollover safely.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <TopSignal
              icon={<CalendarClock className="h-4 w-4" />}
              title="Configure"
              value={rolloverMode === "term_only" ? "Term-Only Rollover" : "Session + Term"}
            />
            <TopSignal icon={<Layers3 className="h-4 w-4" />} title="Map" value="Class Promotion Paths" />
            <TopSignal icon={<Sparkles className="h-4 w-4" />} title="Validate & Execute" value="Preview Gate" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden xl:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workflow</p>
            <ol className="mt-3 space-y-3">
              {["Session", "Term", "Mapping", "Options", "Preview", "Execute"].map((item, idx) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    {idx + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              {preview ? (
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Preview generated
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5" /> Preview pending
                </span>
              )}
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <StageCard
            stage="0"
            title="Rollover Mode"
            description="Select the workflow type before configuring rollover details."
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setMode("session_term")}
                className={[
                  "rounded-2xl border px-4 py-4 text-left transition",
                  rolloverMode === "session_term"
                    ? "border-indigo-300 bg-indigo-50 ring-2 ring-indigo-100"
                    : "border-slate-200 bg-white hover:border-slate-300",
                ].join(" ")}
              >
                <p className="text-sm font-semibold text-slate-900">Session + Term Rollover</p>
                <p className="mt-1 text-xs text-slate-600">
                  Create/select a session, then create/update its term and apply rollover.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode("term_only")}
                disabled={!currentSession}
                className={[
                  "rounded-2xl border px-4 py-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60",
                  rolloverMode === "term_only"
                    ? "border-indigo-300 bg-indigo-50 ring-2 ring-indigo-100"
                    : "border-slate-200 bg-white hover:border-slate-300",
                ].join(" ")}
              >
                <p className="text-sm font-semibold text-slate-900">Term-Only Rollover</p>
                <p className="mt-1 text-xs text-slate-600">
                  Keep current session fixed and create/update only the target term.
                </p>
              </button>
            </div>
          </StageCard>

          <StageCard stage="1" title="Session Setup" description="Create a new session or target an existing one.">
            {rolloverMode === "term_only" ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">Current Session (Locked)</p>
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    Term-Only Mode
                  </span>
                </div>
                {currentSession ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <ReadOnlyField label="Session Name" value={currentSession.name} />
                    <ReadOnlyField label="Start Date" value={currentSession.startDate} />
                    <ReadOnlyField label="End Date" value={currentSession.endDate} />
                  </div>
                ) : (
                  <p className="text-sm text-rose-600">No current session found.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Session Target">
                <select
                  value={targetSessionId}
                  onChange={(event) => setTargetSessionId(event.target.value)}
                  className={inputClass}
                >
                  <option value="new">Create new session</option>
                  {initialSessions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Session Name">
                <input
                  value={sessionName}
                  onChange={(event) => setSessionName(event.target.value)}
                  disabled={targetSessionId !== "new"}
                  placeholder="e.g. 2027/2028"
                  className={`${inputClass} disabled:bg-slate-100`}
                />
              </Field>
              <Field label="Session Start Date">
                <input
                  type="date"
                  value={sessionStartDate}
                  onChange={(event) => setSessionStartDate(event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Session End Date">
                <input
                  type="date"
                  value={sessionEndDate}
                  onChange={(event) => setSessionEndDate(event.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            )}
            <CheckboxRow
              label="Set this session as current"
              checked={sessionCurrent}
              onChange={setSessionCurrent}
              disabled={rolloverMode === "term_only"}
            />
          </StageCard>

          <StageCard stage="2" title="Term Setup" description="Define the academic term and date boundaries.">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Term Type">
                <select
                  value={termType}
                  onChange={(event) => setTermType(event.target.value as (typeof termTypeOptions)[number])}
                  className={inputClass}
                >
                  {termTypeOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Term Name">
                <input
                  value={termName}
                  onChange={(event) => setTermName(event.target.value)}
                  placeholder="e.g. First Term"
                  className={inputClass}
                />
              </Field>
              <Field label="Term Start Date">
                <input
                  type="date"
                  value={termStartDate}
                  onChange={(event) => setTermStartDate(event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Term End Date">
                <input
                  type="date"
                  value={termEndDate}
                  onChange={(event) => setTermEndDate(event.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            <CheckboxRow label="Set this term as current" checked={termCurrent} onChange={setTermCurrent} />
          </StageCard>

          <PromotionMappingCard
            mappings={mappings}
            classes={initialClasses}
            onMappingChange={handleMappingChange}
            disabled={rolloverMode === "term_only"}
          />

          <StageCard stage="4" title="Rollover Options" description="Apply optional rollover behaviors.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <CheckboxRow
                label="Promote students to mapped classes"
                checked={promoteStudents}
                onChange={setPromoteStudents}
                compact
              />
              <CheckboxRow
                label="Carry teacher assignments"
                checked={carryTeacherAssignments}
                onChange={setCarryTeacherAssignments}
                compact
              />
            </div>
          </StageCard>

          <StageCard
            stage="5"
            title="Preview Summary"
            description="Validation checkpoint before execute is unlocked."
            accent="indigo"
            action={
              <button
                type="button"
                onClick={runPreview}
                disabled={previewLoading}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
              >
                {previewLoading ? "Generating..." : "Run Preview"}
                <ChevronRight className="h-4 w-4" />
              </button>
            }
          >
            {!preview ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                No preview generated yet.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <Metric label="Sessions" value={preview.sessionsToCreate} />
                  <Metric label="Terms" value={preview.termsToCreate} />
                  <Metric label="Students" value={preview.studentsToPromote} />
                  <Metric label="Mapped Classes" value={preview.mappedClasses} />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <IssueCard
                    title="Warnings"
                    items={preview.warnings}
                    tone={preview.warnings.length ? "warning" : "ok"}
                    emptyText="No warnings"
                  />
                  <IssueCard
                    title="Blockers"
                    items={preview.blockers}
                    tone={preview.blockers.length ? "danger" : "ok"}
                    emptyText="No blockers"
                  />
                </div>
              </div>
            )}
          </StageCard>

          <StageCard
            stage="6"
            title="Final Confirmation"
            description="High-risk execution step with typed acknowledgement."
            accent="rose"
          >
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-700">
                Mode: {rolloverMode === "term_only" ? "Term-Only Rollover" : "Session + Term Rollover"}
              </p>
              <p className="text-sm text-rose-700">
                Type <span className="font-semibold">{expectedConfirmationText}</span> to execute rollover.
              </p>
              <input
                value={confirmationText}
                onChange={(event) => setConfirmationText(event.target.value)}
                placeholder={expectedConfirmationText}
                className="mt-3 w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              />
              <button
                type="button"
                onClick={handleExecute}
                disabled={!canExecute || executing}
                className="mt-4 w-full rounded-full border border-rose-700 bg-linear-to-r from-rose-700 to-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:from-rose-800 hover:to-rose-700 disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto"
              >
                {executing ? "Executing..." : "Execute Academic Rollover"}
              </button>
            </div>
          </StageCard>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100";

function StageCard({
  stage,
  title,
  description,
  children,
  action,
  accent = "slate",
}: {
  stage: string;
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  accent?: "slate" | "indigo" | "rose";
}) {
  const accentClass =
    accent === "rose"
      ? "border-rose-200/80 bg-linear-to-b from-rose-50/40 to-white"
      : accent === "indigo"
        ? "border-indigo-200/80 bg-linear-to-b from-indigo-50/40 to-white"
        : "border-slate-200 bg-white";

  return (
    <section className={`rounded-3xl border p-5 shadow-sm sm:p-6 ${accentClass}`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
            <CircleDot className="h-3.5 w-3.5" />
            Stage {stage}
          </div>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
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

function CheckboxRow({
  label,
  checked,
  onChange,
  compact = false,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  compact?: boolean;
  disabled?: boolean;
}) {
  return (
    <label
      className={[
        "mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700",
        disabled ? "cursor-not-allowed opacity-70" : "",
        compact ? "mt-0" : "",
      ].join(" ")}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
      {label}
    </label>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function IssueCard({
  title,
  items,
  tone,
  emptyText,
}: {
  title: string;
  items: string[];
  tone: "warning" | "danger" | "ok";
  emptyText: string;
}) {
  const toneClass =
    tone === "danger"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
        {tone === "danger" ? (
          <AlertTriangle className="h-4 w-4" />
        ) : tone === "warning" ? (
          <ShieldAlert className="h-4 w-4" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}
        {title}
        <span className="ml-auto rounded-full bg-white/70 px-2 py-0.5 text-xs">{items.length}</span>
      </p>
      {items.length ? (
        <ul className="space-y-1 text-sm">
          {items.map((item) => (
            <li key={`${title}-${item}`}>- {item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm">{emptyText}</p>
      )}
    </div>
  );
}

function TopSignal({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        {title}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
