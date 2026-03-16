import StudentShell from "@/components/student/StudentShell";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
      <StudentShell>
        {children}
      </StudentShell>
    </main>
  );
}
