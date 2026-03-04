"use client";

import { useState } from "react";
import { BookPlus, UserPlus } from "lucide-react";
import SmartModal from "@/components/modals/SmartModal";
import { createStudentAction, createSubjectAction } from "@/components/actions/actions";
import type { StudentFormClasses, StudentFormData } from "@/components/modals/forms/StudentForm";
import type { SubjectFormData } from "@/components/modals/forms/SubjectForm";

type Props = {
  classId: string;
  classOptions: StudentFormClasses;
};

export default function ClassDetailActions({ classId, classOptions }: Props) {
  const [studentOpen, setStudentOpen] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);

  const studentData: StudentFormData = { classId };
  const subjectData: SubjectFormData = { classId };

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
      <button
        onClick={() => setStudentOpen(true)}
        className="px-4 py-2.5 bg-white text-slate-900 rounded-lg font-medium text-sm hover:bg-indigo-50 transition flex items-center justify-center gap-2"
      >
        <UserPlus className="w-4 h-4" />
        Add Student
      </button>

      <button
        onClick={() => setSubjectOpen(true)}
        className="px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-lg font-medium text-sm hover:bg-white/30 transition flex items-center justify-center gap-2"
      >
        <BookPlus className="w-4 h-4" />
        Add Subject
      </button>

      <SmartModal
        open={studentOpen}
        onClose={() => setStudentOpen(false)}
        type="student"
        mode="create"
        action={createStudentAction}
        data={studentData}
        classes={classOptions}
      />

      <SmartModal
        open={subjectOpen}
        onClose={() => setSubjectOpen(false)}
        type="subject"
        mode="create"
        action={createSubjectAction}
        data={subjectData}
      />
    </div>
  );
}
