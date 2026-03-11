"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserMinus, UserPlus } from "lucide-react";
import UserAvatar from "../UserAvatar";
import ConfirmParentLinkModal from "@/components/modals/ConfirmParentLinkModal";

type LinkedParent = {
    id: string;
    name: string;
    email: string;
    phone: string;
    image?: string | null;
    relationship: "Father" | "Mother" | "Guardian";
};

type ParentCandidate = Omit<LinkedParent, "relationship"> & {
    linkedStudentsCount: number;
};

type LinkResult = {
    ok: boolean;
    message?: string;
};

type LinkAction = (formData: FormData) => Promise<LinkResult>;



const LinkedParentsTable = ({
    studentId,
    linkedParents,
    parents,
    linkAction,
    unlinkAction,
}: {
    studentId: string;
    linkedParents: LinkedParent[];
    parents: ParentCandidate[];
    linkAction: LinkAction;
    unlinkAction: LinkAction;
}) => {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [modalState, setModalState] = useState<{
        open: boolean;
        mode: "link" | "unlink";
        parentId: string;
        parentName: string;
    }>({
        open: false,
        mode: "link",
        parentId: "",
        parentName: "",
    });
    const PAGE_SIZE = 5;

    const filteredParents = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return parents;

        return parents.filter((parent) =>
            parent.name.toLowerCase().includes(q) ||
            parent.email.toLowerCase().includes(q) ||
            parent.phone.toLowerCase().includes(q)
        );
    }, [parents, query]);

    const totalPages = Math.max(1, Math.ceil(filteredParents.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedParents = useMemo(() => {
        const start = (safePage - 1) * PAGE_SIZE;
        return filteredParents.slice(start, start + PAGE_SIZE);
    }, [filteredParents, safePage]);

    return (
        <>
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 p-4">
                    <h3 className="text-sm font-semibold text-slate-900">Linked Parents</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Phone
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Relationship
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {linkedParents.length ? (
                                linkedParents.map((parent) => (
                                    <tr key={parent.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar
                                                    src={parent.image}
                                                    alt={parent.name}
                                                    size={34}
                                                    className="h-9 w-9 border border-slate-200"
                                                />
                                                <p className="text-sm font-medium text-slate-900">{parent.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{parent.email}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{parent.phone}</td>
                                        <td className="px-6 py-4">
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                                {parent.relationship}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setModalState({
                                                        open: true,
                                                        mode: "unlink",
                                                        parentId: parent.id,
                                                        parentName: parent.name,
                                                    })
                                                }
                                                className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                            >
                                                <UserMinus className="h-3.5 w-3.5" />
                                                Unlink
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                                        No parents linked yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 p-4">
                    <h3 className="text-sm font-semibold text-slate-900">Link Parent</h3>

                    <div className="relative mt-4 lg:w-full max-w-md">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            value={query}
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search by name, email, or phone"
                            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Phone
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Linked Students
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedParents.length ? (
                                paginatedParents.map((parent) => (
                                    <tr key={parent.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar
                                                    src={parent.image}
                                                    alt={parent.name}
                                                    size={34}
                                                    className="h-9 w-9 border border-slate-200"
                                                />
                                                <p className="text-sm font-medium text-slate-900">{parent.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{parent.email}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{parent.phone}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{parent.linkedStudentsCount}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setModalState({
                                                        open: true,
                                                        mode: "link",
                                                        parentId: parent.id,
                                                        parentName: parent.name,
                                                    })
                                                }
                                                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                                            >
                                                <UserPlus className="h-3.5 w-3.5" />
                                                Link
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                                        No matching parents available to link.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                        Page {safePage} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={safePage <= 1}
                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            Prev
                        </button>
                        <button
                            type="button"
                            disabled={safePage >= totalPages}
                            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </section>

            <ConfirmParentLinkModal
                open={modalState.open}
                mode={modalState.mode}
                studentId={studentId}
                parentId={modalState.parentId}
                parentName={modalState.parentName}
                linkAction={linkAction}
                unlinkAction={unlinkAction}
                onClose={() =>
                    setModalState((prev) => ({
                        ...prev,
                        open: false,
                    }))
                }
                onSuccess={() => router.refresh()}
            />
        </>

    )
}

export default LinkedParentsTable;
