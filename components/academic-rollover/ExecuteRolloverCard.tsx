"use client";

type Props = {
  canExecute: boolean;
  hasPreview: boolean;
  confirmText: string;
  expectedText: string;
  executing: boolean;
  onConfirmTextChange: (value: string) => void;
  onExecute: () => void;
};

export default function ExecuteRolloverCard({
  canExecute,
  hasPreview,
  confirmText,
  expectedText,
  executing,
  onConfirmTextChange,
  onExecute,
}: Props) {
  return (
    <section className="rounded-2xl border border-rose-200 bg-rose-50/70 p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-rose-900 sm:text-lg">Final Confirmation</h2>
        <p className="mt-1 text-sm text-rose-700">
          This is a sensitive operation. Ensure preview is clean before execution.
        </p>
      </div>

      <div className="rounded-xl border border-rose-200 bg-white p-4">
        <p className="text-sm text-slate-700">
          Type <span className="font-semibold text-rose-700">{expectedText}</span> to enable execution.
        </p>
        <input
          value={confirmText}
          onChange={(event) => onConfirmTextChange(event.target.value)}
          placeholder={expectedText}
          className="mt-3 w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
        <span
          className={[
            "inline-flex items-center rounded-full px-3 py-1 font-semibold",
            hasPreview ? "bg-slate-100 text-slate-700" : "bg-amber-100 text-amber-700",
          ].join(" ")}
        >
          {hasPreview ? "Preview ready" : "Preview required"}
        </span>
        <span
          className={[
            "inline-flex items-center rounded-full px-3 py-1 font-semibold",
            canExecute ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700",
          ].join(" ")}
        >
          {canExecute ? "Ready to execute" : "Blocked"}
        </span>
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={onExecute}
          disabled={!canExecute || executing}
          className="w-full rounded-full border border-rose-700 bg-linear-to-r from-rose-700 to-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_-18px_rgba(190,24,93,0.7)] transition hover:from-rose-800 hover:to-rose-700 disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto"
        >
          {executing ? "Executing..." : "Execute Academic Rollover"}
        </button>
      </div>
    </section>
  );
}
