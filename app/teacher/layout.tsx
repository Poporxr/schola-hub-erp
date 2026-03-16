import TeacherShell from "@/components/teacher/TeacherShell";


export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
      <TeacherShell>
        {children}
      </TeacherShell>
    </main>
  );
}
