import { subjectsMock } from "@/utils/students";
import { Clock, Users } from "lucide-react";
import Image from "next/image";

const Page = () => {
  return (
    <div className=" space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjectsMock.map((subject) => (
          <div
            key={subject.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow"
          >
            {/* Header Image */}
            <div className="relative h-32 bg-indigo-600">
              <Image
                src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="cover"
                fill
                className="object-cover opacity-50 group-hover:opacity-40 transition-opacity"
              />

              <div className="absolute bottom-0 text-white">
                <h3 className="font-bold text-lg">{subject.name}</h3>
                <p className="text-xs opacity-90">Code: {subject.id}</p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Teacher */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-10 h-10 overflow-hidden rounded-full bg-gray-200">
                  <Image
                    src={subject.teacher.avatar}
                    alt={subject.teacher.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {subject.teacher.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {subject.teacher.role}
                  </p>
                </div>
              </div>

              {/* Meta */}
              <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                <span className="inline-flex items-center">
                  <Clock className="w-4 h-4 inline mr-1" />
                  4h / week
                </span>

                <span className="inline-flex items-center">
                  <Users className="w-4 h-4 inline mr-1" />
                  32 Students
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
