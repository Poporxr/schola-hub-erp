"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
  sessions: { id: string; name: string }[];
  terms: { id: string; name: string; sessionId: string }[];
  levels: { id: string; name: string }[];
  defaultSessionId: string | null;
  defaultTermId: string | null;
  currentSessionName: string | null;
  initialStructure?: {
    id: string;
    name: string;
    termId: string;
    levelId: string;
    items: { id: string; name: string; amount: number; optional: boolean }[];
  } | null;
};

type LineItem = { id: string; name: string; amount: number; optional: boolean };

export default function CreateFeeStructureModal({
  open,
  onClose,
  sessions,
  terms,
  levels,
  defaultSessionId,
  defaultTermId,
  currentSessionName,
  initialStructure,
}: Props) {
  const router = useRouter();
  const [items, setItems] = useState<LineItem[]>([]);
  const [name, setName] = useState("");
  const [sessionId, setSessionId] = useState(defaultSessionId ?? "");
  const [termId, setTermId] = useState(defaultTermId ?? "");
  const [levelId, setLevelId] = useState(levels[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);

  const termOptions = useMemo(
    () => terms.filter((t) => !sessionId || t.sessionId === sessionId),
    [terms, sessionId]
  );

  useEffect(() => {
    if (!open) return;
    if (!initialStructure) {
      setSessionId(defaultSessionId ?? "");
      setName("");
      setItems([]);
      setTermId(defaultTermId ?? "");
      setLevelId(levels[0]?.id ?? "");
      return;
    }
    setName(initialStructure.name);
    setItems(
      initialStructure.items.map((item) => ({
        id: item.id,
        name: item.name,
        amount: item.amount,
        optional: item.optional,
      }))
    );
    setTermId(initialStructure.termId);
    setLevelId(initialStructure.levelId);
  }, [open, initialStructure, defaultTermId, levels]);

  const total = useMemo(
    () => items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0),
    [items]
  );

  const resetForm = () => {
    setName("");
    setItems([]);
    setLevelId(levels[0]?.id ?? "");
  };

  const handleSubmit = async (mode: "draft" | "active") => {
    if (!name.trim()) {
      toast.error("Structure name is required.");
      return;
    }
    if (!sessionId || !termId) {
      toast.error("Session and term are required.");
      return;
    }
    if (!levelId) {
      toast.error("Select a level for this structure.");
      return;
    }
    if (items.length === 0) {
      toast.error("Add at least one fee item.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        sessionId,
        termId,
        levelId,
        items: items.map((item) => ({
          name: item.name.trim(),
          amount: Number(item.amount) || 0,
          isOptional: item.optional,
        })),
        status: mode === "active" ? "ACTIVE" : "DRAFT",
      };

      const response = await fetch(
        initialStructure
          ? `/api/admin/fees/structures/${initialStructure.id}`
          : "/api/admin/fees/structures",
        {
          method: initialStructure ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || "Failed to save structure.");
      }

      toast.success(
        initialStructure
          ? "Structure updated."
          : mode === "active"
            ? "Structure activated."
            : "Draft saved."
      );
      resetForm();
      onClose();
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col m-4 overflow-auto">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {initialStructure ? "Edit Fee Structure" : "Create Fee Structure"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Current session: {currentSessionName ?? "Not set"}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="p-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Structure Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., JSS Term 2 Fees"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Session
                </label>
                <input
                  value={
                    sessions.find((s) => s.id === sessionId)?.name ??
                    currentSessionName ??
                    ""
                  }
                  disabled
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Term
                </label>
                <select
                  value={termId}
                  onChange={(e) => setTermId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500"
                >
                  {termOptions.map((term) => (
                    <option key={term.id} value={term.id}>
                      {term.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Level
                </label>
                <select
                  value={levelId}
                  onChange={(e) => setLevelId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500"
                >
                  {levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-slate-700">
                  Line Items
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setItems((p) => [
                      ...p,
                      { id: crypto.randomUUID(), name: "", amount: 0, optional: false },
                    ])
                  }
                  className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Item
                </button>
              </div>

              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-2 items-start">
                    <input
                      value={item.name}
                      onChange={(e) =>
                        setItems((p) =>
                          p.map((x) =>
                            x.id === item.id ? { ...x, name: e.target.value } : x
                          )
                        )
                      }
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm"
                      placeholder="Item name"
                    />
                    <input
                      type="number"
                      min={0}
                      value={item.amount}
                      onChange={(e) =>
                        setItems((p) =>
                          p.map((x) =>
                            x.id === item.id
                              ? { ...x, amount: Number(e.target.value) || 0 }
                              : x
                          )
                        )
                      }
                      className="w-32 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-right"
                      placeholder="0"
                    />
                    <label className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                      <input
                        type="checkbox"
                        checked={item.optional}
                        onChange={(e) =>
                          setItems((p) =>
                            p.map((x) =>
                              x.id === item.id
                                ? { ...x, optional: e.target.checked }
                                : x
                            )
                          )
                        }
                      />
                      Optional
                    </label>
                    <button
                      type="button"
                      onClick={() => setItems((p) => p.filter((x) => x.id !== item.id))}
                      className="p-2 text-red-400 hover:text-red-600"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 pt-4 border-t border-slate-100">
              <span className="text-sm text-slate-500">Total Amount:</span>
              <span className="text-xl font-bold text-slate-900">
                ₦{total.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSubmit("draft")}
              disabled={submitting}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
            >
              {initialStructure ? "Save" : "Save Draft"}
            </button>

            <button
              type="button"
              onClick={() => handleSubmit("active")}
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 shadow-sm disabled:opacity-60"
            >
              {initialStructure ? "Save & Activate" : "Activate Structure"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
