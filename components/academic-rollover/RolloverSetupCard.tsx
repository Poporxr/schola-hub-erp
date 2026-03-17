"use client";

import type { RolloverOptions, SessionOption, TermOption } from "./types";

type Props = {
  sessions: SessionOption[];
  terms: TermOption[];
  selectedSessionId: string;
  selectedTermId: string;
  options: RolloverOptions;
  onSessionChange: (value: string) => void;
  onTermChange: (value: string) => void;
  onToggleOption: (key: keyof RolloverOptions) => void;
};

export default function RolloverSetupCard({
  sessions,
  terms,
  selectedSessionId,
  selectedTermId,
  options,
  onSessionChange,
  onTermChange,
  onToggleOption,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900 sm:text-lg">Target Session and Term</h2>
        <p className="mt-1 text-sm text-slate-500">
          Select where the new active academic context should point after rollover.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Target Session</span>
          <select
            value={selectedSessionId}
            onChange={(event) => onSessionChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          >
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Target Term</span>
          <select
            value={selectedTermId}
            onChange={(event) => onTermChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          >
            {terms.map((term) => (
              <option key={term.id} value={term.id}>
                {term.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="mb-3 text-sm font-semibold text-slate-800">Rollover Options</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <OptionToggle
            label="Copy class teacher assignments"
            checked={options.copyClassTeachers}
            onChange={() => onToggleOption("copyClassTeachers")}
          />
          <OptionToggle
            label="Copy subject teacher assignments"
            checked={options.copySubjectTeachers}
            onChange={() => onToggleOption("copySubjectTeachers")}
          />
          <OptionToggle
            label="Carry class-subject links"
            checked={options.carryClassSubjects}
            onChange={() => onToggleOption("carryClassSubjects")}
          />
          <OptionToggle
            label="Archive graduating classes"
            checked={options.archiveGraduatingClasses}
            onChange={() => onToggleOption("archiveGraduatingClasses")}
          />
        </div>
      </div>
    </section>
  );
}

function OptionToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
      <span>{label}</span>
    </label>
  );
}
