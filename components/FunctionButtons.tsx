"use client";
import { Download, Mail } from "lucide-react";
import { toast } from "sonner";


export const FunctionButttons = () => {
    return (
        <>
            <button onClick={() => {toast.success("Comming soon!")}} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Message
            </button>

            <button onClick={() => {
                toast.success("Comming soon!")
            }} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-indigo-50 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
            </button>
        </>
    );
}