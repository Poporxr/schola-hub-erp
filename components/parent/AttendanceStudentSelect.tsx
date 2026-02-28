"use client";

type StudentOption = {
  id: string;
  firstName: string | null;
  lastName: string | null;
};

export default function AttendanceStudentSelect({
  students,
  selectedId,
  onChange,
}: {
  students: StudentOption[];
  selectedId: string;
  onChange: (value: string) => void;
}) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <select
      value={selectedId}
      onChange={handleChange}
      className="w-full md:w-[40%] px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
    >
      {students.map((student) => (
        <option key={student.id} value={student.id}>
          {student.firstName ?? ""} {student.lastName ?? ""}
        </option>
      ))}
    </select>
  );
}
