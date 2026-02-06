import AttendanceClient from "@/components/teacher/AttendanceClient";


type StudentRow = {
  id: string;
  sn: number;
  name: string;
  admissionNo: string;
  gender: "Male" | "Female";
  status: "present" | "absent" | "late";
};

export default async function Page() {
  // In real life, fetch this from DB on the server:
  const students: StudentRow[] = [
    { id: "1", sn: 1, name: "Adeyemi Tunde", admissionNo: "JSS2A/2024/001", gender: "Male", status: "present" },
    { id: "2", sn: 2, name: "Okonkwo Chioma", admissionNo: "JSS2A/2024/002", gender: "Female", status: "present" },
    { id: "3", sn: 3, name: "Ibrahim Fatima", admissionNo: "JSS2A/2024/003", gender: "Female", status: "absent" },
    { id: "4", sn: 4, name: "Eze Chukwudi", admissionNo: "JSS2A/2024/004", gender: "Male", status: "late" },
    { id: "5", sn: 5, name: "Bello Aisha", admissionNo: "JSS2A/2024/005", gender: "Female", status: "present" },
  ];

  return <AttendanceClient initialStudents={students} />;
}
