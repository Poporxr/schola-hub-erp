"use client";

import { usePathname } from "next/navigation";
import { Sliders } from "lucide-react";

type FilterItem = { id: string; name: string };

type Props = {
  sessions: FilterItem[];
  terms: FilterItem[];
  classes: FilterItem[];
  subjects: FilterItem[];
  selectedSessionId?: string;
  selectedTermId?: string;
  selectedClassId?: string;
  selectedSubjectId?: string;
};

export default function ResultsFilters(props: Props) {
  const {
    sessions,
    terms,
    classes,
    subjects,
    selectedSessionId,
    selectedTermId,
    selectedClassId,
    selectedSubjectId,
  } = props;

  const pathname = usePathname();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-slate-900">
          <Sliders className="w-5 h-5 text-slate-700" />
          <h3 className="font-semibold">Filter Result Entry</h3>
        </div>
        <span className="text-xs text-slate-500">Select filters to load students</span>
      </div>

      <form method="GET" action={pathname} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Session
          </label>
          <select
            name="sessionId"
            defaultValue={selectedSessionId ?? ""}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          >
            <option value="">Select session</option>
            {sessions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Term
          </label>
          <select
            name="termId"
            defaultValue={selectedTermId ?? ""}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          >
            <option value="">Select term</option>
            {terms.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Class
          </label>
          <select
            name="classId"
            defaultValue={selectedClassId ?? ""}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          >
            <option value="">Select class</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Subject
          </label>
          <select
            name="subjectId"
            defaultValue={selectedSubjectId ?? ""}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          >
            <option value="">Select subject</option>
            {subjects.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Apply
          </button>
        </div>
      </form>
    </div>
  );
}
