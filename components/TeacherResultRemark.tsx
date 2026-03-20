import { MessageSquare } from "lucide-react";

type TeacherRemarkProps = {
    remark: string;
    principalRemark?: string;
    teacherName: string;
    className: string;
    principalName?: string;
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

const TeacherResultRemark = ({
    remark,
    principalRemark,
    teacherName,
    className,
    principalName = "Principal",
    date,
}: TeacherRemarkProps) => {
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-900">Form Teacher&apos;s Remark</h3>
                </div>
                <p className="text-slate-700 mb-4">&quot;{remark}&quot;</p>
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
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-900">Principal&apos;s Remark</h3>
                </div>
                <p className="text-slate-700 mb-4">
                    &quot;{principalRemark ?? "No principal remark available for this result."}&quot;
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div>
                        <p className="text-sm font-semibold text-slate-900">{principalName}</p>
                        <p className="text-xs text-slate-600">School Head</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-600">Date</p>
                        <p className="text-sm font-semibold text-slate-900">{formatDate(date)}</p>
                    </div>
                </div>
            </div>
        </div>

    );
};
export default TeacherResultRemark;
