import { Plus } from "lucide-react";
import SubjectCard, { type SubjectCardItem } from "./SubjectCard";
import { role } from "@/lib/utils";

const ClassSubjects = ({ subjects }: { subjects: SubjectCardItem[] }) => {

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/80 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
              Class Subjects
            </h2>
            <p className="text-sm text-slate-500">
              Subjects offered by this class and assigned staff
            </p>
          </div>


        </div>
      </div>

      <div className="border-b border-slate-100 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
            {subjects.length} subject{subjects.length === 1 ? "" : "s"}
          </span>
          <span>Curriculum overview for this class</span>
        </div>
      </div>

      <SubjectCard subjects={subjects} />
    </section>
  );
};

export default ClassSubjects;