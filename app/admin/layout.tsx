import AdminShell from "@/components/AdminShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen mb-20 bg-slate-50">
      <AdminShell>
        {children}
      </AdminShell>
    </main>
  );
}
