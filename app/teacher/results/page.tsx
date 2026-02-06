import ResultsEntryClient, {
  type ResultStudent,
  type ResultContext,
} from "@/components/teacher/ResultEntryClient";

async function getResultsEntryData(): Promise<{
  ctx: ResultContext;
  students: ResultStudent[];
}> {
  // ✅ Replace this with your real DB fetch.
  const students: ResultStudent[] = [
    { id: 1, name: "ADEYEMI, Oluwaseun", admNo: "ADM/2024/001", test: 8, exam: 62, status: "draft" },
    { id: 2, name: "BELLO, Fatima", admNo: "ADM/2024/002", test: 12, exam: 58, status: "error" },
    { id: 3, name: "CHUKWU, Emmanuel", admNo: "ADM/2024/003", test: 7, exam: 65, status: "saved" },
    { id: 4, name: "DANJUMA, Aisha", admNo: "ADM/2024/004", test: 9, exam: 68, status: "submitted" },
    { id: 5, name: "EZE, Chidinma", admNo: "ADM/2024/005", test: 6, exam: 54, status: "saved" },
    { id: 6, name: "IBRAHIM, Yusuf", admNo: "ADM/2024/006", test: 8, exam: 61, status: "draft" },
    { id: 7, name: "JOHNSON, Grace", admNo: "ADM/2024/007", test: 9, exam: 67, status: "saved" },
    { id: 8, name: "MUSA, Abdullahi", admNo: "ADM/2024/008", test: 7, exam: 59, status: "saved" },
    { id: 9, name: "NWOSU, Chinedu", admNo: "ADM/2024/009", test: 10, exam: 70, status: "saved" },
    { id: 10, name: "OKAFOR, Blessing", admNo: "ADM/2024/010", test: 5, exam: 48, status: "draft" },
    { id: 11, name: "SULEIMAN, Halima", admNo: "ADM/2024/011", test: 8, exam: 63, status: "saved" },
    { id: 12, name: "WILLIAMS, David", admNo: "ADM/2024/012", test: 9, exam: 66, status: "saved" },
  ];

  const ctx: ResultContext = {
    className: "JSS 2A",
    subjectName: "Mathematics",
    termLabel: "Term 2",
    totalStudentsLabel: `${students.length} students`,
    lastSavedLabel: "11:24 AM",
    maxTest: 15,
    maxExam: 80,
  };

  return { ctx, students };
}

export default async function Page() {
  const { ctx, students } = await getResultsEntryData();

  return (
    <div className="space-y-6">
      <ResultsEntryClient ctx={ctx} initialStudents={students} />
    </div>
  );
}
