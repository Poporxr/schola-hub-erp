import TeacherShell from "@/components/teacher/TeacherShell";


export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">  
      <div className="flex-1 overflow-y-auto custom-scroll bg-slate-50" >
        <TeacherShell>
           {children}
        </TeacherShell>

      </div>
    </main>
  );
}
