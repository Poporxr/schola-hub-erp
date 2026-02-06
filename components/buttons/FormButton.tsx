"use client"

import { Edit, Edit2, Plus } from "lucide-react"
import { useState } from "react";
import SmartModal, { ModalType } from "../modals/SmartModal";
import { createStudentAction, updateStudentAction } from "../actions/actions";



type Action = "create" | "edit"
type FormButtonProps = {
    type: ModalType;
    action: Action
};

const FormButton = ({ type, action }: FormButtonProps) => {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"create" | "edit">(action);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);


    return (
        <>

            {type === 'student' && mode === 'edit'
                ? <button
                    onClick={() => {
                        setSelectedStudent(null);
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

            {(mode === "create" && type === "student") || (mode === "create" && type === "teacher") ? <button
                onClick={() => {
                    setSelectedStudent(null);
                    setMode("create");
                    setOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                {mode === "create" && <Plus className="w-4 h-4" />}
                <span className="text-sm font-medium">{mode === 'create' ? `Create ${type}` : `Edit ${type}`}</span>
            </button> : ''}

            <SmartModal
                open={open}
                onClose={() => setOpen(false)}
                type={type}              // class | student | subject | teacher
                mode={mode}               // create | edit
                data={selectedStudent}      // null for create
                action={mode === "edit" ? updateStudentAction : createStudentAction}
            />
        </>

    )
}

export default FormButton;
