import { MessageSquare } from "lucide-react";

const TeacherResultRemark = () => {
    return (
        <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-slate-900">Form Teacher's Remark</h3>
            </div>
            <p className="text-slate-700 mb-4">"Liam has demonstrated exceptional academic performance throughout the term. His dedication to learning, excellent behavior, and positive attitude make him a role model for his peers. He consistently participates in class activities and shows great leadership qualities. Keep up the outstanding work!"</p>
            <div className="flex items-center justify-between pt-4 border-t border-blue-200">
                <div>
                    <p className="text-sm font-semibold text-slate-900">Mrs. Sarah Jenkins</p>
                    <p className="text-xs text-slate-600">Form Teacher, Grade 3A</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-600">Date</p>
                    <p className="text-sm font-semibold text-slate-900">15th January, 2024</p>
                </div>
            </div>
        </div>

    );
};
export default TeacherResultRemark;