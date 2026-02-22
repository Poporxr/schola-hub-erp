"use client";

import { useMemo, useState } from "react";
import { Download, Link2, Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import CreateFeeStructureModal from "@/components/modals/CreateFeeStructure";
import AssignFeeStructureModal from "@/components/modals/AssignFeeStructure";
import FeeLedgerModal from "@/components/modals/FeeLedgerModal";
import EditFeeAssignmentModal from "@/components/modals/EditFeeAssignmentModal";
import FeeDeleteModal from "@/components/modals/FeeDeleteModal";
import { formatCurrency } from "@/lib/settings";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type FeeItem = { id: string; name: string; amount: number; optional: boolean };
type FeeStructureRow = {
  id: string;
  name: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  createdBy: string;
  sessionName: string;
  termName: string;
  termId: string;
  levelId: string;
  total: number;
  items: FeeItem[];
};

type AssignmentRow = {
  id: string;
  classId: string;
  className: string;
  structureId: string;
  structureName: string;
  sessionId: string;
  termId: string;
  students: number;
  expected: number;
  collected: number;
  outstanding: number;
  progress: number;
};

type SessionOption = { id: string; name: string };

type TermOption = { id: string; name: string; sessionId: string };

type LevelOption = { id: string; name: string };

type ClassOption = { id: string; name: string };

type FeesManagementClientProps = {
  feeStructures: FeeStructureRow[];
  assignments: AssignmentRow[];
  sessions: SessionOption[];
  terms: TermOption[];
  levels: LevelOption[];
  classes: ClassOption[];
  currentSessionId: string | null;
  currentSessionName: string | null;
  currentTermId: string | null;
};

export default function FeesManagementClient({
  feeStructures,
  assignments,
  sessions,
  terms,
  levels,
  classes,
  currentSessionId,
  currentSessionName,
  currentTermId,
}: FeesManagementClientProps) {
  const router = useRouter();
  const [openCreate, setOpenCreate] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [selectedId, setSelectedId] = useState(feeStructures[0]?.id ?? "");
  const [ledgerAssignmentId, setLedgerAssignmentId] = useState<string | null>(null);
  const [editingStructure, setEditingStructure] = useState<FeeStructureRow | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentRow | null>(null);
  const [deleteStructure, setDeleteStructure] = useState<FeeStructureRow | null>(null);
  const [deleteAssignment, setDeleteAssignment] = useState<AssignmentRow | null>(null);
  const [assignmentSessionId, setAssignmentSessionId] = useState(
    currentSessionId ?? sessions[0]?.id ?? ""
  );

  const selected = useMemo(() => {
    return feeStructures.find((f) => f.id === selectedId) ?? feeStructures[0];
  }, [feeStructures, selectedId]);

  const filteredAssignments = useMemo(() => {
    if (!assignmentSessionId) return assignments;
    return assignments.filter((a) => a.sessionId === assignmentSessionId);
  }, [assignments, assignmentSessionId]);

  const handleDeleteStructure = async (structure: FeeStructureRow) => {
    try {
      const response = await fetch(`/api/admin/fees/structures/${structure.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Failed to delete structure.");
      }
      toast.success("Fee structure deleted.");
      router.refresh();
      setDeleteStructure(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete.";
      toast.error(message);
    }
  };

  const handleDeleteAssignment = async (assignment: AssignmentRow) => {
    try {
      const response = await fetch(`/api/admin/fees/assignments/${assignment.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Failed to delete assignment.");
      }
      toast.success("Assignment removed.");
      router.refresh();
      setDeleteAssignment(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete.";
      toast.error(message);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              School Fees Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Configure fee structures and track class assignments
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>

            <button
              onClick={() => setOpenAssign(true)}
              className="px-4 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-50 flex items-center gap-2"
            >
              <Link2 className="w-4 h-4" />
              Assign to Class
            </button>

            <button
              onClick={() => setOpenCreate(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Structure
            </button>
          </div>
        </div>

        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fee Structures */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-semibold text-slate-900">Fee Structures</h3>
              <div className="text-xs text-slate-500">
                Current session: {currentSessionName ?? "Not set"}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white border-b border-slate-100">
                  <tr>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase">
                      Name
                    </th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase">
                      Term
                    </th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">
                      Total
                    </th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">
                      Status
                    </th>
                    <th className="p-4 w-24 text-right" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {feeStructures.length === 0 ? (
                    <tr>
                      <td className="p-6 text-sm text-slate-500" colSpan={5}>
                        No fee structures created yet.
                      </td>
                    </tr>
                  ) : (
                    feeStructures.map((row) => {
                      const active = row.id === selectedId;
                      return (
                        <tr
                          key={row.id}
                          onClick={() => setSelectedId(row.id)}
                          className={`hover:bg-slate-50 cursor-pointer ${
                            active ? "bg-indigo-50/50" : ""
                          }`}
                        >
                          <td className="p-4">
                            <p className="text-sm font-medium text-slate-900">
                              {row.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              Created by {row.createdBy}
                            </p>
                          </td>
                          <td className="p-4 text-sm text-slate-600">
                            {row.termName || "—"}
                          </td>
                          <td className="p-4 text-sm font-bold text-slate-900 text-right">
                            {formatCurrency(row.total)}
                          </td>
                          <td className="p-4 text-center">
                            {row.status === "ACTIVE" ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                Draft
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingStructure(row);
                                  setOpenCreate(true);
                                }}
                                className="text-slate-400 hover:text-indigo-600"
                                aria-label="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteStructure(row);
                                }}
                                className="text-slate-400 hover:text-red-600"
                                aria-label="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Structure Preview */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">
                Structure Breakdown
              </h3>
              <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">
                {selected?.name?.includes("JSS") ? "JSS" : "Structure"}
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
              {selected?.items?.length ? (
                selected.items.map((it) => (
                  <div
                    key={it.id}
                    className={`flex justify-between items-center py-2 ${
                      it.optional
                        ? "text-slate-400 italic"
                        : "border-b border-slate-100"
                    }`}
                  >
                    <span className="text-sm">
                      {it.name}
                      {it.optional ? " (Optional)" : ""}
                    </span>
                    <span className="text-sm font-medium text-slate-900">
                      {formatCurrency(it.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500">No items yet.</div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-xl text-indigo-600">
                  {selected ? formatCurrency(selected.total) : "₦0"}
                </span>
              </div>
              <button
                onClick={() => {
                  if (!selected) return;
                  setEditingStructure(selected);
                  setOpenCreate(true);
                }}
                className="w-full py-2 border border-slate-200 text-slate-700 font-medium rounded-md hover:bg-slate-50 text-sm flex items-center justify-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                Edit Structure
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Assignments */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-semibold text-slate-900">Class Fee Assignments</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Session</span>
              <select
                value={assignmentSessionId}
                onChange={(e) => setAssignmentSessionId(e.target.value)}
                className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white"
              >
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase">
                    Class
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase">
                    Structure Assigned
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">
                    Students
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">
                    Expected
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">
                    Collected
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">
                    Outstanding
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">
                    Progress
                  </th>
                  <th className="p-4 w-40 text-right" />
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td className="p-6 text-sm text-slate-500" colSpan={8}>
                      No class assignments found.
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="p-4 text-sm font-bold text-slate-900">
                        {a.className}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {a.structureName}
                      </td>
                      <td className="p-4 text-sm text-slate-900 text-center">
                        {a.students}
                      </td>
                      <td className="p-4 text-sm text-slate-600 text-right">
                        {formatCurrency(a.expected)}
                      </td>
                      <td className="p-4 text-sm text-green-600 font-medium text-right">
                        {formatCurrency(a.collected)}
                      </td>
                      <td className="p-4 text-sm text-red-600 font-medium text-right">
                        {formatCurrency(a.outstanding)}
                      </td>
                      <td className="p-4 w-32">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${a.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">
                            {a.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setLedgerAssignmentId(a.id)}
                            className="text-indigo-600 hover:text-indigo-700 text-xs font-medium inline-flex items-center gap-1"
                          >
                            <BookOpen className="w-3 h-3" />
                            View Ledger
                          </button>
                          <button
                            onClick={() => setEditingAssignment(a)}
                            className="text-slate-400 hover:text-indigo-600"
                            aria-label="Edit assignment"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteAssignment(a)}
                            className="text-slate-400 hover:text-red-600"
                            aria-label="Delete assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CreateFeeStructureModal
        open={openCreate}
        onClose={() => {
          setOpenCreate(false);
          setEditingStructure(null);
        }}
        sessions={sessions}
        terms={terms}
        levels={levels}
        defaultSessionId={currentSessionId ?? sessions[0]?.id ?? null}
        defaultTermId={currentTermId ?? null}
        currentSessionName={currentSessionName}
        initialStructure={editingStructure}
      />
      <AssignFeeStructureModal
        open={openAssign}
        onClose={() => setOpenAssign(false)}
        feeStructures={feeStructures}
        classes={classes}
        defaultStructureId={feeStructures[0]?.id ?? null}
        defaultClassIds={classes.slice(0, 1).map((c) => c.id)}
      />
      <EditFeeAssignmentModal
        open={Boolean(editingAssignment)}
        onClose={() => setEditingAssignment(null)}
        assignment={editingAssignment}
        feeStructures={feeStructures}
        classes={classes}
      />
      <FeeLedgerModal
        assignmentId={ledgerAssignmentId}
        onClose={() => setLedgerAssignmentId(null)}
      />
      <FeeDeleteModal
        open={Boolean(deleteStructure)}
        onClose={() => setDeleteStructure(null)}
        title="Delete Fee Structure"
        subtitle="This will permanently remove the fee structure and its items."
        label={deleteStructure?.name ?? ""}
        entityLabel="fee structure"
        onConfirm={async () => {
          if (!deleteStructure) return;
          await handleDeleteStructure(deleteStructure);
        }}
      />
      <FeeDeleteModal
        open={Boolean(deleteAssignment)}
        onClose={() => setDeleteAssignment(null)}
        title="Remove Fee Assignment"
        subtitle="This removes the fee structure from the selected class."
        label={
          deleteAssignment
            ? `${deleteAssignment.structureName} -> ${deleteAssignment.className}`
            : ""
        }
        entityLabel="assignment"
        requireText={false}
        onConfirm={async () => {
          if (!deleteAssignment) return;
          await handleDeleteAssignment(deleteAssignment);
        }}
      />
    </>
  );
}
