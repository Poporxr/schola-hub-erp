"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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

  const router = useRouter();
  const pathname = usePathname();

  const [sessionId, setSessionId] = useState(selectedSessionId ?? "");
  const [termId, setTermId] = useState(selectedTermId ?? "");
  const [classId, setClassId] = useState(selectedClassId ?? "");
  const [subjectId, setSubjectId] = useState(selectedSubjectId ?? "");

  const canSubmit = useMemo(
    () => Boolean(sessionId && termId && classId && subjectId),
    [sessionId, termId, classId, subjectId]
  );

  function pushQuery(next: {
    sessionId?: string;
    termId?: string;
    classId?: string;
    subjectId?: string;
  }) {
    const params = new URLSearchParams();
    if (next.sessionId) params.set("sessionId", next.sessionId);
    if (next.termId) params.set("termId", next.termId);
    if (next.classId) params.set("classId", next.classId);
    if (next.subjectId) params.set("subjectId", next.subjectId);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <Sliders className="w-5 h-5 text-indigo-600" />
        Filter Result Entry
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Session</label>
          <select
            name="sessionId"
            value={sessionId}
            onChange={(e) => {
              const next = e.target.value;
              setSessionId(next);
              setTermId("");
              setClassId("");
              setSubjectId("");
              pushQuery({ sessionId: next });
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {sessions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Term</label>
          <select
            name="termId"
            value={termId}
            onChange={(e) => {
              const next = e.target.value;
              setTermId(next);
              setClassId("");
              setSubjectId("");
              pushQuery({ sessionId, termId: next });
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {terms.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Class</label>
          <select
            name="classId"
            value={classId}
            onChange={(e) => {
              const next = e.target.value;
              setClassId(next);
              setSubjectId("");
              pushQuery({ sessionId, termId, classId: next });
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
          <select
            name="subjectId"
            value={subjectId}
            onChange={(e) => {
              const next = e.target.value;
              setSubjectId(next);
              pushQuery({ sessionId, termId, classId, subjectId: next });
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {subjects.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => pushQuery({ sessionId, termId, classId, subjectId })}
            disabled={!canSubmit}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
