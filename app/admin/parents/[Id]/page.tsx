import BackButton from "@/components/BackButton";
import { ChevronRight, Mail, MapPin, Phone, PlusCircle } from "lucide-react";
import Image from "next/image";

const Page = () => {
    return (
        <div className="space-y-6">
            <BackButton />

            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <Image
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt=""
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-sm"
                    />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Mr. David Okonkwo
                        </h1>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                Active
                            </span>
                            <span className="text-sm text-slate-400">-</span>
                            <span className="text-sm text-slate-500">ID: P-2023-045</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        <Mail className="h-4 w-4" /> Message
                    </button>
                </div>
            </div>

            {/* Contact + Linked Students */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900">Contact Info</h3>
                        <button className="text-xs font-medium text-indigo-600 hover:underline">
                            Edit
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500">
                                <Phone className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Phone Number</p>
                                <p className="text-sm font-medium text-slate-900">
                                    +234 801 234 5678
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500">
                                <Mail className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Email Address</p>
                                <p className="text-sm font-medium text-slate-900">
                                    david.okonkwo@email.com
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500">
                                <MapPin className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Home Address</p>
                                <p className="text-sm font-medium text-slate-900">
                                    15 Admiralty Way, Lekki Phase 1, Lagos State
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 font-semibold text-slate-900">
                        Linked Students (2)
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50">
                            <Image
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64"
                                alt=""
                                width={10}
                                height={10}
                                className="h-10 w-10 rounded-full object-cover"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-900">
                                    Chioma Okonkwo
                                </p>
                                <p className="text-xs text-slate-500">
                                    Class: JSS 1A - ID: ST-001
                                </p>
                            </div>
                            <button className="text-slate-400 hover:text-indigo-600">
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50">
                            <Image
                                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64"
                                alt=""
                                width={10}
                                height={10}
                                className="h-10 w-10 rounded-full object-cover"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-900">
                                    Emeka Okonkwo
                                </p>
                                <p className="text-xs text-slate-500">
                                    Class: SSS 2B - ID: ST-002
                                </p>
                            </div>
                            <button className="text-slate-400 hover:text-indigo-600">
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Message + Admin Notes (take up space) */}
            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
                <form className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
                    <h3 className="mb-4 font-semibold text-slate-900">Quick Message</h3>

                    <div className="flex flex-1 flex-col space-y-3">
                        <input
                            type="text"
                            placeholder="Subject"
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        />

                        <textarea
                            rows={6}
                            placeholder="Type your message..."
                            className="flex-1 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        />

                        <div className="flex gap-2 overflow-x-auto pb-2">
                            <button className="whitespace-nowrap rounded bg-slate-100 px-2 py-1 text-xs text-slate-600 hover:bg-slate-200">
                                PTA Meeting
                            </button>
                        </div>

                        <button type="submit" className="mt-auto w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                            Send Message
                        </button>
                    </div>
                </form>

                <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
                    <h3 className="mb-3 font-semibold text-slate-900">Admin Notes</h3>

                    <div className="mb-3 rounded-lg border border-yellow-100 bg-yellow-50 p-3">
                        <p className="text-sm text-yellow-800">
                            Parent prefers communications via email and responds within 24 hours.
                        </p>
                        <p className="mt-1 text-xs text-yellow-600">Added by Admin - Oct 20, 2023</p>
                    </div>

                    <button className="mt-auto flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline">
                        <PlusCircle className="h-4 w-4" /> Add Note
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Page;
