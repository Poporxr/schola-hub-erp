"use client";

import { useState } from "react";
import { Download, Link2, Plus } from "lucide-react";
import CreateFeeStructureModal from "@/components/modals/CreateFeeStructure";
import AssignFeeStructureModal from "@/components/modals/AssignFeeStructure";
import { assignments, feeStructures } from "@/utils/students";



const currency = (n: number) =>
  `₦${n.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

export default function FeesManagementClient() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);





  const [selectedId, setSelectedId] = useState(feeStructures[0]?.id);
  const selected =
    feeStructures.find((f) => f.id === selectedId) ?? feeStructures[0];

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
              <select className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white">
                <option>2023/2024 Session</option>
              </select>
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
                    <th className="p-4 w-10" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {feeStructures.map((row) => {
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
                        <td className="p-4 text-sm text-slate-600">{row.term}</td>
                        <td className="p-4 text-sm font-bold text-slate-900 text-right">
                          {currency(row.total)}
                        </td>
                        <td className="p-4 text-center">
                          {row.status === "Active" ? (
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="text-slate-400 hover:text-indigo-600"
                            aria-label="More"
                          >
                            •••
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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
              {selected?.items?.map((it, idx) => (
                <div
                  key={`${it.name}-${idx}`}
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
                    {currency(it.amount)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-xl text-indigo-600">
                  {selected ? currency(selected.total) : "₦0"}
                </span>
              </div>
              <button className="w-full py-2 border border-slate-200 text-slate-700 font-medium rounded-md hover:bg-slate-50 text-sm">
                Edit Structure
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Assignments */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Class Fee Assignments</h3>
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
                  <th className="p-4 w-10" />
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {assignments.map((a) => (
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
                      {currency(a.expected)}
                    </td>
                    <td className="p-4 text-sm text-green-600 font-medium text-right">
                      {currency(a.collected)}
                    </td>
                    <td className="p-4 text-sm text-red-600 font-medium text-right">
                      {currency(a.outstanding)}
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
                      <button className="text-indigo-600 hover:text-indigo-700 text-xs font-medium">
                        View Ledger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CreateFeeStructureModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
      />
      <AssignFeeStructureModal
        open={openAssign}
        onClose={() => setOpenAssign(false)}
      />
    </>
  );
}
