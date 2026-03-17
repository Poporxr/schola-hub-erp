"use client";

import { Edit2, Plus } from "lucide-react";
import { useState } from "react";
import SmartModal, { ModalType } from "../modals/SmartModal";
import {
  createClassAction,
  createSubjectAction,
  createTeacherAction,
  updateClassAction,
  updateSubjectAction,
  updateTeacherAction,
} from "../actions/actions";
import { createStudentAction, updateStudentAction } from "../actions/student-actions";
import type { ClassFormData, ClassFormMeta } from "../modals/forms/ClassForm";
import type { StudentFormClasses, StudentFormData } from "../modals/forms/StudentForm";
import type { SubjectFormData } from "../modals/forms/SubjectForm";
import type { TeacherFormData } from "../modals/forms/TeacherForm";

type Action = "create" | "edit";

type FormButtonProps =
  | {
      type: "student";
      action: Action;
      data?: StudentFormData;
      classes?: StudentFormClasses;
    }
  | {
      type: "teacher";
      action: Action;
      data?: TeacherFormData;
    }
  | {
      type: "subject";
      action: Action;
      data?: SubjectFormData;
    }
  | {
      type: "class";
      action: Action;
      data?: ClassFormData;
      meta?: ClassFormMeta;
    };

const createButtonClass =
  "group inline-flex items-center justify-center gap-2 rounded-full border border-slate-300/80 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50/60 hover:text-indigo-700 hover:shadow-[0_16px_30px_-18px_rgba(79,70,229,0.4)] active:translate-y-0";

const iconEditButtonClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700";

const classEditButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-white/20 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/30";

const typeLabels: Record<ModalType, string> = {
  student: "Student",
  teacher: "Teacher",
  subject: "Subject",
  class: "Class",
};

const FormButton = (props: FormButtonProps) => {
  const { type, action } = props;
  const isStudent = type === "student";
  const isTeacher = type === "teacher";
  const isSubject = type === "subject";
  const classes = isStudent ? props.classes : undefined;
  const studentData = isStudent ? props.data : undefined;
  const teacherData = isTeacher ? props.data : undefined;
  const subjectData = isSubject ? props.data : undefined;
  const classData = type === "class" ? props.data : undefined;
  const classMeta = type === "class" ? props.meta : undefined;

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">(action);
  const [selectedStudent, setSelectedStudent] = useState<StudentFormData | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherFormData | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectFormData | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassFormData | null>(null);

  const actionHandler = (() => {
    if (type === "student") return mode === "edit" ? updateStudentAction : createStudentAction;
    if (type === "teacher") return mode === "edit" ? updateTeacherAction : createTeacherAction;
    if (type === "class") return mode === "edit" ? updateClassAction : createClassAction;
    if (type === "subject") return mode === "edit" ? updateSubjectAction : createSubjectAction;
    return createStudentAction;
  })();

  const openCreateModal = () => {
    setSelectedStudent(null);
    setSelectedTeacher(null);
    setSelectedSubject(null);
    setSelectedClass(null);
    setMode("create");
    setOpen(true);
  };

  const openEditModal = () => {
    if (type === "student") setSelectedStudent(studentData ?? null);
    if (type === "teacher") setSelectedTeacher(teacherData ?? null);
    if (type === "subject") setSelectedSubject(subjectData ?? null);
    if (type === "class") setSelectedClass(classData ?? null);
    setMode("edit");
    setOpen(true);
  };

  return (
    <>
      {mode === "edit" && type !== "class" ? (
        <button
          type="button"
          onClick={openEditModal}
          aria-label={`Edit ${typeLabels[type]}`}
          className={iconEditButtonClass}
        >
          <Edit2 className="h-4 w-4" />
        </button>
      ) : null}

      {mode === "edit" && type === "class" ? (
        <button
          type="button"
          onClick={openEditModal}
          aria-label="Edit Class"
          className={classEditButtonClass}
        >
          <Edit2 className="h-4 w-4" />
          Edit Class
        </button>
      ) : null}

      {mode === "create" ? (
        <button
          type="button"
          onClick={openCreateModal}
          aria-label={`Create ${typeLabels[type]}`}
          className={createButtonClass}
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white transition-colors group-hover:bg-indigo-600">
            <Plus className="h-3.5 w-3.5" />
          </span>
          <span>Create {typeLabels[type]}</span>
        </button>
      ) : null}

      {type === "student" ? (
        <SmartModal
          open={open}
          onClose={() => setOpen(false)}
          type="student"
          mode={mode}
          action={actionHandler}
          data={selectedStudent ?? undefined}
          classes={classes}
        />
      ) : type === "teacher" ? (
        <SmartModal
          open={open}
          onClose={() => setOpen(false)}
          type="teacher"
          mode={mode}
          action={actionHandler}
          data={selectedTeacher ?? undefined}
        />
      ) : type === "subject" ? (
        <SmartModal
          open={open}
          onClose={() => setOpen(false)}
          type="subject"
          mode={mode}
          action={actionHandler}
          data={selectedSubject ?? undefined}
        />
      ) : (
        <SmartModal
          open={open}
          onClose={() => setOpen(false)}
          type={type}
          mode={mode}
          action={actionHandler}
          data={selectedClass ?? undefined}
          meta={classMeta}
        />
      )}
    </>
  );
};

export default FormButton;
