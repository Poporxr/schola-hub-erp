"use client";

import { useMemo, useState } from "react";
import { X, Trash2, Plus } from "lucide-react";
import { createFeeStructure } from "@/components/actions/actions";

type Props = { open: boolean; onClose: () => void };
type LineItem = { id: string; name: string; amount: number };

export default function CreateFeeStructureModal({ open, onClose }: Props) {
  const [items, setItems] = useState<LineItem[]>([
  ]);

  const total = useMemo(
    () => items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0),
    [items]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col m-4 overflow-auto">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Create Fee Structure</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          action={async (fd) => {
            await createFeeStructure(fd);
            onClose();
          }}
          className="flex-1 flex flex-col"
        >
          <div className="p-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Structure Name
                </label>
                <input
                  name="name"
                  required
                  placeholder="e.g., JSS Term 2 Fees"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Session
                </label>
                <select
                  name="session"
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option>2023/2024</option>
                  <option>2024/2025</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Term
                </label>
                <select
                  name="term"
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option>1st Term</option>
                  <option>2nd Term</option>
                  <option>3rd Term</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Level (Optional)
                </label>
                <select
                  name="level"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="">—</option>
                  <option>Junior Secondary (JSS)</option>
                  <option>Senior Secondary (SSS)</option>
                  <option>Primary</option>
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
                      { id: crypto.randomUUID(), name: "", amount: 0 },
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
                      name="itemName"
                      required
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
                      name="itemAmount"
                      required
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
              type="submit"
              name="mode"
              value="draft"
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50"
            >
              Save Draft
            </button>

            <button
              type="submit"
              name="mode"
              value="active"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 shadow-sm"
            >
              Activate Structure
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
