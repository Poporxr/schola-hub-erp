import { Calendar, Download, Hash, Printer, School } from "lucide-react";
import { StudentResultHeaderData } from "@/components/student/results/types";
import UserAvatar from "@/components/UserAvatar";
import Link from "next/link";

const ResultHeroCard = ({ data }: { data: StudentResultHeaderData }) => {
  return (
    <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden mt-6 mb-6">
      <div className="absolute right-4 top-4 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute left-0 bottom-0 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <UserAvatar
            src={data.image}
            alt="Student Profile"
            size={80}
            className="w-20 h-20 border-4 border-white/20 mb-3"
          />
          <div>
            <h1 className="text-3xl text-white font-bold mb-1">{data.fullName}</h1>
            <div className="lg:flex items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <Hash className="w-4 h-4" />
                {data.admissionNumber}
              </span>
              <span className="flex items-center gap-1">
                <School className="w-4 h-4" />
                {data.className ?? "-"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {(data.termName ?? "-") + " " + (data.sessionName ?? "")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/print/${data.studentId}`}
            className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Result
          </Link>
          <button className="px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors shadow-lg flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultHeroCard;
