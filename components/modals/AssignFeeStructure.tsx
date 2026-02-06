"use client";

import { X } from "lucide-react";
import { assignFeeToClass } from "@/components/actions/actions";

type Props = { open: boolean; onClose: () => void };

export default function AssignFeeStructureModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Assign Fee to Class</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          action={async (fd) => {
            await assignFeeToClass(fd);
            onClose();
          }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Select Fee Structure
            </label>
            <select
              name="feeStructureId"
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="fs1">JSS Term 1 Fees (₦185,000)</option>
              <option value="fs2">SSS Term 1 Fees (₦210,000)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Select Class
            </label>
            <select
              name="classId"
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="c1">JSS 2A</option>
              <option value="c2">JSS 2B</option>
              <option value="c3">JSS 2C</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Due Date
            </label>
            <input
              name="dueDate"
              type="date"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 -mx-6 -mb-6 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 shadow-sm"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
