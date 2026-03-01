import { Sliders } from "lucide-react";
import { OptionItem } from "@/components/student/results/types";

type Props = {
  sessions: OptionItem[];
  terms: OptionItem[];
  classes: OptionItem[];
  selectedSessionId?: string;
  selectedTermId?: string;
  selectedClassId?: string;
};

const ResultFiltersCard = ({
  sessions,
  terms,
  classes,
  selectedSessionId,
  selectedTermId,
  selectedClassId,
}: Props) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <Sliders className="w-5 h-5 text-slate-500" />
        Filter Results
      </h3>
      <form method="get" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Session</label>
          <select
            name="sessionId"
            defaultValue={selectedSessionId}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Term</label>
          <select
            name="termId"
            defaultValue={selectedTermId}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            {terms.map((term) => (
              <option key={term.id} value={term.id}>
                {term.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Class</label>
          <select
            name="classId"
            defaultValue={selectedClassId}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </select>
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

export default ResultFiltersCard;
