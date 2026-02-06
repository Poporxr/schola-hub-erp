import Image from "next/image";
import StudentTabs from "@/components/StudentTab";
import BackButton from "@/components/BackButton";

const Page = async () => {

    return (
        <div className="">
            <BackButton />

            <div className="">
                {/* Profile Header */}
                <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
                    <div className="flex flex-col justify-center gap-6">
                        <div>
                            <Image
                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                alt="Admin"
                                className="w-29 h-29 rounded-full object-cover"
                                width={100}
                                height={100}
                            />
                        </div>


                        <div className="flex-1">
                            <div className="flex items-start justify-between mb-4 ">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                                        Emma Johnson
                                    </h3>
                                    <p className="text-gray-500 mb-2">
                                        Student ID: STU-001
                                    </p>
                                    <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                                        Active Student
                                    </span>
                                </div>
                            </div>

                            <div className="grid lg:grid-cols-4 md:grid-cols-4 gap-6 grid-cols-2">
                                <Info label="Class" value="Grade 5-A" />
                                <Info label="Age" value="10 years" />
                                <Info label="Gender" value="Female" />
                                <Info label="Date of Birth" value="March 15, 2014" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Client Tabs */}
                <StudentTabs />
            </div>
        </div>
    );
};

export default Page;

const Info = ({ label, value }: { label: string; value: string }) => (
    <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
);
