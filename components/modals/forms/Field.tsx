function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 sm:text-sm">{label}</label>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-1 text-xs text-red-600 sm:text-sm">{error}</p> : null}
    </div>
  );
}
export default Field;
