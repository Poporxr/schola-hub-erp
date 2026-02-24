export default function RouteSkeleton() {
  const rows = Array.from({ length: 6 });
  const cards = Array.from({ length: 4 });

  return (
    <div className="space-y-6 animate-pulse" role="status" aria-live="polite" aria-label="Loading">
      <div className="flex items-center justify-between gap-4">
        <div className="h-8 w-48 rounded bg-slate-200" />
        <div className="h-9 w-28 rounded bg-slate-200" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((_, index) => (
          <div key={`card-${index}`} className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="h-7 w-16 rounded bg-slate-200" />
            <div className="h-3 w-20 rounded bg-slate-200" />
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
        <div className="h-6 w-40 rounded bg-slate-200" />
        <div className="space-y-2">
          {rows.map((_, index) => (
            <div key={`row-${index}`} className="flex items-center gap-3">
              <div className="h-4 w-4 rounded bg-slate-200" />
              <div className="h-4 flex-1 rounded bg-slate-200" />
              <div className="h-4 w-20 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
