"use client"

import { Edit, Edit2, Plus } from "lucide-react"
import { useState } from "react";
import SmartModal, { ModalType } from "../modals/SmartModal";
import { createClassAction, createSubjectAction, createTeacherAction, updateClassAction, updateSubjectAction, updateTeacherAction } from "../actions/actions";
import { createStudentAction, updateStudentAction } from "../actions/student-actions";
import type { StudentFormClasses, StudentFormData } from "../modals/forms/StudentForm";
import type { SubjectFormData } from "../modals/forms/SubjectForm";
import type { TeacherFormData } from "../modals/forms/TeacherForm";



type Action = "create" | "edit"
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
        type: Exclude<ModalType, "student" | "teacher" | "subject">;
        action: Action;
    };

const FormButton = (props: FormButtonProps) => {
    const { type, action } = props;
    const isStudent = type === "student";
    const isTeacher = type === "teacher";
    const isSubject = type === "subject";
    const data = isStudent ? props.data : undefined;
    const teacherData = isTeacher ? props.data : undefined;
    const subjectData = isSubject ? props.data : undefined;
    const classes = isStudent ? props.classes : undefined;
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"create" | "edit">(action);
    const [selectedStudent, setSelectedStudent] = useState<StudentFormData | null>(null);
    const [selectedTeacher, setSelectedTeacher] = useState<TeacherFormData | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<SubjectFormData | null>(null);

    const actionHandler = (() => {
        if (type === "student") return mode === "edit" ? updateStudentAction : createStudentAction;
        if (type === "teacher") return mode === "edit" ? updateTeacherAction : createTeacherAction;
        if (type === "class") return mode === "edit" ? updateClassAction : createClassAction;
        if (type === "subject") return mode === "edit" ? updateSubjectAction : createSubjectAction;
        return createStudentAction;
    })();


    return (
        <>

            {type === 'student' && mode === 'edit'
                ? <button
                    onClick={() => {
                        setSelectedStudent(data ?? null);
                        setMode("edit");
                        setOpen(true);
                    }}
                    className="text-muted-foreground hover:text-primary mx-1">
                    <Edit2 className="w-4 h-4" />
                </button>
                : ''}

            {type === 'teacher' && mode === 'edit'
                ? <button
                    onClick={() => {
                        setSelectedTeacher(teacherData ?? null);
                        setMode("edit");
                        setOpen(true);
                    }}
                    className="text-muted-foreground hover:text-primary mx-1">
                    <Edit2 className="w-4 h-4" />
                </button>
                : ''}

            {type === 'subject' && mode === 'edit'
                ? <button
                    onClick={() => {
                        setSelectedSubject(subjectData ?? null);
                        setMode("edit");
                        setOpen(true);
                    }}
                    className="text-muted-foreground hover:text-primary mx-1">
                    <Edit2 className="w-4 h-4" />
                </button>
                : ''}

            {type === 'class' && mode === 'edit'
                ? <button
                    onClick={() => {
                        setSelectedStudent(null);
                        setMode("edit");
                        setOpen(true);
                    }}
                    className="px-4 py-2.5  cursor-pointer bg-white/20 backdrop-blur-sm text-white rounded-lg font-medium text-sm hover:bg-white/30 transition flex items-center justify-center gap-2">
                    <Edit className="w-4 h-4" />
                    Edit Class
                </button> :''}

            {(mode === "create" && (type === "student" || type === "teacher" || type === "class" || type === "subject")) ? <button
                onClick={() => {
                    setSelectedStudent(null);
                    setSelectedTeacher(null);
                    setSelectedSubject(null);
                    setMode("create");
                    setOpen(true);
                }}
                    className="btn-primary">
                {mode === "create" && <Plus className="w-4 h-4" />}
                <span className="text-sm font-medium">{mode === 'create' ? `Create ${type}` : `Edit ${type}`}</span>
            </button> : ''}

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
                />
            )}
        </>

    )
}

export default FormButton;
