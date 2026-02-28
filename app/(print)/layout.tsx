export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-white mx-auto h-screen overflow-y-auto">
      {children}
    </main>
  );
}
