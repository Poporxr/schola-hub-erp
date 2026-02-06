export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-white mx-auto print-scroll">
      {children}
    </main>
  );
}
