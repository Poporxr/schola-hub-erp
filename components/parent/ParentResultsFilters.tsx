"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sliders } from "lucide-react";

type TermOption = { id: string; name: string };
type SessionOption = { id: string; name: string; terms: TermOption[] };
type StudentOption = { id: string; name: string };

type ParentResultsFiltersProps = {
  sessions: SessionOption[];
  students: StudentOption[];
  initialSessionId?: string;
  initialTermId?: string;
  initialStudentId?: string;
};

const ParentResultsFilters = ({
  sessions,
  students,
  initialSessionId,
  initialTermId,
  initialStudentId,
}: ParentResultsFiltersProps) => {
  const router = useRouter();
  const [sessionId, setSessionId] = useState(initialSessionId ?? sessions[0]?.id ?? "");
  const activeSession = useMemo(
    () => sessions.find((session) => session.id === sessionId) ?? sessions[0],
    [sessions, sessionId],
  );
  const terms = activeSession?.terms ?? [];
  const [termId, setTermId] = useState(initialTermId ?? terms[0]?.id ?? "");
  const [studentId, setStudentId] = useState(initialStudentId ?? students[0]?.id ?? "");

  const handleSessionChange = (value: string) => {
    setSessionId(value);
    const nextSession = sessions.find((session) => session.id === value);
    const nextTerm = nextSession?.terms?.[0]?.id ?? "";
    setTermId(nextTerm);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!studentId || !sessionId || !termId) return;
    router.push(`/parent/results?studentId=${studentId}&sessionId=${sessionId}&termId=${termId}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
      <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <Sliders className="w-5 h-5 text-slate-500" />
        Filter Results
      </h3>
      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Terms</label>
          <Select value={termId} onValueChange={setTermId}>
            <SelectTrigger className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
              <SelectValue placeholder="Select Term" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectGroup>
                {terms.map((term) => (
                  <SelectItem key={term.id} className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black" value={term.id}>
                    {term.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Sessions</label>
          <Select value={sessionId} onValueChange={handleSessionChange}>
            <SelectTrigger className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
              <SelectValue placeholder="Select Session" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectGroup>
                {sessions.map((session) => (
                  <SelectItem key={session.id} className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black" value={session.id}>
                    {session.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Select Ward</label>
          <Select value={studentId} onValueChange={setStudentId}>
            <SelectTrigger className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
              <SelectValue placeholder="Select Ward" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectGroup>
                {students.map((student) => (
                  <SelectItem key={student.id} className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black" value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full px-4 py-2 bg-linear-to-r from-slate-900 to-slate-800 text-white rounded-lg text-sm font-medium hover:from-slate-800 hover:to-slate-700 transition-all shadow-md"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default ParentResultsFilters;
