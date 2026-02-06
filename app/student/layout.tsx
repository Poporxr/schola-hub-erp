import StudentShell from "@/components/student/StudentShell";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

  <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen mb-20">  
      <div className="flex-1 overflow-y-auto custom-scroll bg-slate-50" >
        <StudentShell>
           {children}
        </StudentShell>

      </div>
    </main>
  );
}
