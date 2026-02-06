import { subjectsMock } from "@/utils/students";
import Image from "next/image";
import { Globe, MoreVertical, } from "lucide-react";
import { role } from "@/lib/utils";
import { DeleteButton } from "./buttons/DeleteButton";

const SubjectCard = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 sm:p-6">
            {subjectsMock.map((subject) => (

                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition" key={subject.id}>
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center shrink-0">
                                <Globe className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">{subject.name}</h3>
                                <p className="text-xs text-gray-500">{subject.schedule}</p>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                            <MoreVertical className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                        <Image width={10} height={10} src={subject.teacher.avatar} alt="Teacher" className="w-8 h-8 rounded-full object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{subject.teacher.name}</p>
                            <p className="text-xs text-gray-500 truncate">{subject.teacher.role}</p>
                        </div>
                        {role === 'admin' && <div className="flex gap-2">
                            <button className="text-indigo-600 hover:text-indigo-900 text-xs font-medium">Edit</button>
                            <DeleteButton teacher={subject} type="subject"/>
                        </div>}
                    </div>
                </div>
            ))}

        </div>
    )
}

export default SubjectCard;