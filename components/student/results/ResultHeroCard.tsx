import { Calendar, Download, Hash, Printer, School } from "lucide-react";
import { StudentResultHeaderData } from "@/components/student/results/types";
import Image from "next/image";
import Link from "next/link";

const ResultHeroCard = ({ data }: { data: StudentResultHeaderData }) => {
  return (
    <div className="px-6 bg-[#7E2CEE] py-6 rounded-xl mt-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-indigo-50 mb-3">
            <Image
              src={data.image ?? "/default-avatar.png"}
              alt="Student Profile"
              className="w-full h-full object-cover"
              width={80}
              height={80}
            />
          </div>
          <div>
            <h1 className="text-3xl text-white/90 font-bold mb-1">{data.fullName}</h1>
            <div className="lg:flex items-center gap-4 text-white/90 text-sm">
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
            className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Result
          </Link>
          <button className="px-4 py-2 bg-white text-purple-700 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors shadow-lg flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultHeroCard;
