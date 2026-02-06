"use client";

import { useState } from "react";
import {
    Calculator,
    FlaskConical,
    Book,
    Landmark,
} from "lucide-react";

type Tab = "personal" | "subjects" | "results";

const StudentTabs = () => {
    const [activeTab, setActiveTab] = useState<Tab>("personal");

    return (
        <div className="bg-white rounded-xl border border-gray-200">
            {/* Tabs Header */}
            <div className="border-b border-gray-200 overflow-auto  px-6">
                <div className="flex gap-8">
                    {(["personal", "subjects", "results", "attendance"] as Tab[]).map(
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
                                    <p className="text-sm font-medium text-gray-900">emma.johnson@school.edu</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                                    <p className="text-sm font-medium text-gray-900">+1 234 567 8901</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Address</p>
                                    <p className="text-sm font-medium text-gray-900">123 Main Street, City, State 12345</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-5">
                            <h4 className="text-lg font-bold text-gray-900 mb-4">Parent Information</h4>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Parent Name</p>
                                    <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Parent Phone</p>
                                    <p className="text-sm font-medium text-gray-900">+1 234 567 8900</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Parent Email</p>
                                    <p className="text-sm font-medium text-gray-900">sarah.johnson@email.com</p>
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

                    <div className="grid lg:grid-cols-2 gap-4">
                        <Subject
                            icon={<Calculator className="w-5 h-5 text-blue-600" />}
                            color="bg-blue-100"
                            title="Mathematics"
                            teacher="Dr. Sarah Williams"
                        />
                        <Subject
                            icon={<FlaskConical className="w-5 h-5 text-green-600" />}
                            color="bg-green-100"
                            title="Science"
                            teacher="Prof. John Anderson"
                        />
                        <Subject
                            icon={<Book className="w-5 h-5 text-purple-600" />}
                            color="bg-purple-100"
                            title="English"
                            teacher="Ms. Emily Davis"
                        />
                        <Subject
                            icon={<Landmark className="w-5 h-5 text-orange-600" />}
                            color="bg-orange-100"
                            title="History"
                            teacher="Mr. Robert Taylor"
                        />
                    </div>
                </div>
            )}

            {/* Results */}
            {activeTab === "results" && (
                <div className="p-6 space-y-4">
                    <Result subject="Mathematics" score="92%" grade="A" />
                    <Result subject="Science" score="88%" grade="B+" />
                    <Result subject="English" score="95%" grade="A+" />
                    <Result subject="History" score="90%" grade="A" />
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
}: {
    subject: string;
    score: string;
    grade: string;
}) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
            <p className="font-semibold text-gray-900">{subject}</p>
            <p className="text-xs text-gray-500">Term 1, 2024</p>
        </div>
        <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{score}</p>
            <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                {grade}
            </span>
        </div>
    </div>
);
