"use client"

import { Printer } from "lucide-react"

const PrintButton = () => {
    return (
        <button className="flex justify-center gap-2 cursor-pointer bg-[#5b7cf1] items-center no-print rounded border px-3 py-2 fixed right-5 bottom-5" onClick={() => window.print()}>
            <Printer size={15}/>
            <span>Print</span>
        </button>

    )
}
export default PrintButton;