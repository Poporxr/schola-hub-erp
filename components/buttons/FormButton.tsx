"use client"

import { Edit, Edit2, Plus } from "lucide-react"
import { useState } from "react";
import SmartModal, { ModalType } from "../modals/SmartModal";
import { createStudentAction, updateStudentAction } from "../actions/actions";
import type { StudentFormClasses, StudentFormData } from "../modals/forms/StudentForm";



type Action = "create" | "edit"
type FormButtonProps =
    | {
        type: "student";
        action: Action;
        data?: StudentFormData;
        classes?: StudentFormClasses;
    }
    | {
        type: Exclude<ModalType, "student">;
        action: Action;
    };

const FormButton = (props: FormButtonProps) => {
    const { type, action } = props;
    const isStudent = type === "student";
    const data = isStudent ? props.data : undefined;
    const classes = isStudent ? props.classes : undefined;
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"create" | "edit">(action);
    const [selectedStudent, setSelectedStudent] = useState<StudentFormData | null>(null);


    return (
        <>

            {type === 'student' && mode === 'edit'
                ? <button
                    onClick={() => {
                        setSelectedStudent(data ?? null);
                        setMode("edit");
                        setOpen(true);
                    }}
                    className="text-slate-400 hover:text-blue-600 mx-1">
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

            {(mode === "create" && (type === "student" || type === "teacher" || type === "class")) ? <button
                onClick={() => {
                    setSelectedStudent(null);
                    setMode("create");
                    setOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                {mode === "create" && <Plus className="w-4 h-4" />}
                <span className="text-sm font-medium">{mode === 'create' ? `Create ${type}` : `Edit ${type}`}</span>
            </button> : ''}

            {type === "student" ? (
                <SmartModal
                    open={open}
                    onClose={() => setOpen(false)}
                    type="student"
                    mode={mode}
                    action={mode === "edit" ? updateStudentAction : createStudentAction}
                    data={selectedStudent ?? undefined}
                    classes={classes}
                />
            ) : (
                <SmartModal
                    open={open}
                    onClose={() => setOpen(false)}
                    type={type}
                    mode={mode}
                    action={mode === "edit" ? updateStudentAction : createStudentAction}
                />
            )}
        </>

    )
}

export default FormButton;
