"use client"

import { Edit2 } from "lucide-react";
import { useState } from "react";
import AddClassModal from "./modals/AddClassModal";


const ActionButton = () => {
    const [openCreate, setOpenCreate] = useState(false);

    return (
        <div>
            <button onClick={() => setOpenCreate(true)} className="text-slate-400 hover:text-blue-600 mx-1"><Edit2 className="w-4 h-4" /> </button>
            <AddClassModal 
                open={openCreate}
                onClose={() => setOpenCreate(false)} 
            />
        </div>

    )
}

export default ActionButton;