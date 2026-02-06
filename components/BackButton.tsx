'use client'

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const BackButton = () => {
    const router = useRouter();
    return (
        <button onClick={() => router.back()} className="flex items-center gap-2 text-md text-slate-500 hover:text-indigo-600 mb-4">
            <ArrowLeft className="w-10 h-5" />
            <p>Back</p>
        </button>
    )
}

export default BackButton;