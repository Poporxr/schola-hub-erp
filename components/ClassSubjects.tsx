import { Plus } from "lucide-react";
import SubjectCard, { type SubjectCardItem } from "./SubjectCard";
import { role } from "@/lib/utils";

const ClassSubjects = ({ subjects }: { subjects: SubjectCardItem[] }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">Subjects & Teachers</h2>
                    <p className="text-sm text-gray-500">{subjects.length} subjects assigned</p>
                </div>
                {role === 'admin' ? <button className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Subject
                </button> : ''}
            </div>
            <SubjectCard subjects={subjects} />

        </div>
    )
};

export default ClassSubjects;
