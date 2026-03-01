import { MessageSquare } from "lucide-react";

type TeacherRemarkProps = {
    remark: string;
    teacherName: string;
    className: string;
    date?: Date;
};

const formatDate = (date?: Date) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date);
};

const TeacherResultRemark = ({ remark, teacherName, className, date }: TeacherRemarkProps) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-slate-900">Form Teacher's Remark</h3>
            </div>
            <p className="text-slate-700 mb-4">"{remark}"</p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div>
                    <p className="text-sm font-semibold text-slate-900">{teacherName}</p>
                    <p className="text-xs text-slate-600">Form Teacher, {className}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-600">Date</p>
                    <p className="text-sm font-semibold text-slate-900">{formatDate(date)}</p>
                </div>
            </div>
        </div>

    );
};
export default TeacherResultRemark;
