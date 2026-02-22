"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Assignment = {
  id: string;
  classId: string;
  className: string;
  structureId: string;
  structureName: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  feeStructures: { id: string; name: string }[];
  classes: { id: string; name: string }[];
};

export default function EditFeeAssignmentModal({
  open,
  onClose,
  assignment,
  feeStructures,
  classes,
}: Props) {
  const router = useRouter();
  const [structureId, setStructureId] = useState("");
  const [classId, setClassId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!assignment) return;
    setStructureId(assignment.structureId);
    setClassId(assignment.classId);
  }, [assignment]);

  const handleSubmit = async () => {
    if (!assignment) return;
    if (!structureId || !classId) {
      toast.error("Select both class and fee structure.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/admin/fees/assignments/${assignment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feeStructureId: structureId, classId }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Failed to update assignment.");
      }

      toast.success("Assignment updated.");
      onClose();
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !assignment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Edit Assignment</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Fee Structure
            </label>
            <select
              value={structureId}
              onChange={(e) => setStructureId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500"
            >
              {feeStructures.map((structure) => (
                <option key={structure.id} value={structure.id}>
                  {structure.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Class
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
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
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 shadow-sm disabled:opacity-60"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
