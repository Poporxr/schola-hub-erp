"use client";

import { useMemo, useState } from "react";
import {
    Calculator,
    FlaskConical,
    Book,
    Landmark,
} from "lucide-react";

type Tab = "personal" | "subjects" | "results";

type StudentTabProps = {
    contact: {
        email?: string | null;
        phone?: string | null;
        address?: string | null;
    };
    parents: {
        name: string;
        phone?: string | null;
        email?: string | null;
        relation?: string | null;
        isPrimary?: boolean;
    }[];
    subjects: {
        id: string;
        name: string;
        teacher?: string | null;
    }[];
    results: {
        subject: string;
        score: number;
        grade?: string | null;
        termLabel: string;
    }[];
};

const StudentTabs = ({ contact, parents, subjects, results }: StudentTabProps) => {
    const [activeTab, setActiveTab] = useState<Tab>("personal");
    const primaryParent = useMemo(() => parents.find((p) => p.isPrimary) ?? parents[0], [parents]);

    return (
        <div className="bg-white rounded-xl border border-gray-200">
            {/* Tabs Header */}
            <div className="border-b border-gray-200 overflow-auto  px-6">
                <div className="flex gap-8">
                    {(["personal", "subjects", "results"] as Tab[]).map(
                        tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 text-sm font-medium border-b-2 ${activeTab === tab
                                        ? "text-blue-600 border-blue-600"
                                        : "text-gray-600 border-transparent hover:text-gray-900"
                                    }`}
                            >
                                {tab === "personal" && "Personal Info"}
                                {tab === "subjects" && "Subjects"}
                                {tab === "results" && "Results"}
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* Personal Info */}
            {activeTab === "personal" && (
                <div className=" p-6">
                    <div className="grid lg:grid-cols-2 lg:gap-6 ">
                        <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h4>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Email</p>
                                    <p className="text-sm font-medium text-gray-900">{contact.email ?? "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                                    <p className="text-sm font-medium text-gray-900">{contact.phone ?? "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Address</p>
                                    <p className="text-sm font-medium text-gray-900">{contact.address ?? "—"}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-5">
                            <h4 className="text-lg font-bold text-gray-900 mb-4">Parent Information</h4>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Parent Name</p>
                                    <p className="text-sm font-medium text-gray-900">{primaryParent?.name ?? "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Parent Phone</p>
                                    <p className="text-sm font-medium text-gray-900">{primaryParent?.phone ?? "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Parent Email</p>
                                    <p className="text-sm font-medium text-gray-900">{primaryParent?.email ?? "—"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Subjects */}
            {activeTab === "subjects" && (
                <div className="p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">
                        Enrolled Subjects
                    </h4>

                    {subjects.length ? (
                        <div className="grid lg:grid-cols-2 gap-4">
                            {subjects.map((s, idx) => (
                                <Subject
                                    key={s.id}
                                    icon={<SubjectIcon index={idx} />}
                                    color={subjectColor(idx)}
                                    title={s.name}
                                    teacher={s.teacher ?? "—"}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No subjects assigned.</p>
                    )}
                </div>
            )}

            {/* Results */}
            {activeTab === "results" && (
                <div className="p-6 space-y-4">
                    {results.length ? (
                        results.map((r) => (
                            <Result
                                key={`${r.subject}-${r.termLabel}`}
                                subject={r.subject}
                                score={`${r.score}%`}
                                grade={r.grade ?? "—"}
                                termLabel={r.termLabel}
                            />
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">No results available.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentTabs;

/* ===== Helpers ===== */

const Subject = ({
    icon,
    color,
    title,
    teacher,
}: {
    icon: React.ReactNode;
    color: string;
    title: string;
    teacher: string;
}) => (
    <div className="p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-3">
            <div
                className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}
            >
                {icon}
            </div>
            <div>
                <p className="font-semibold text-gray-900">{title}</p>
                <p className="text-xs text-gray-500">{teacher}</p>
            </div>
        </div>
    </div>
);

const Result = ({
    subject,
    score,
    grade,
    termLabel,
}: {
    subject: string;
    score: string;
    grade: string;
    termLabel: string;
}) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
            <p className="font-semibold text-gray-900">{subject}</p>
            <p className="text-xs text-gray-500">{termLabel}</p>
        </div>
        <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{score}</p>
            <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                {grade}
            </span>
        </div>
    </div>
);

const iconOptions = [
    Calculator,
    FlaskConical,
    Book,
    Landmark,
] as const;

const colorOptions = ["bg-blue-100", "bg-green-100", "bg-purple-100", "bg-orange-100"] as const;

const SubjectIcon = ({ index }: { index: number }) => {
    const Icon = iconOptions[index % iconOptions.length];
    const color = ["text-blue-600", "text-green-600", "text-purple-600", "text-orange-600"][index % iconOptions.length];
    return <Icon className={`w-5 h-5 ${color}`} />;
};

const subjectColor = (index: number) => colorOptions[index % colorOptions.length];
