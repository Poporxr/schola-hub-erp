"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/settings";

type LedgerPayment = {
  id: string;
  amount: number;
  status: string;
  paymentDate: string;
  studentName: string;
  parentName: string | null;
};

type LedgerResponse = {
  assignment: { id: string; class: { name: string }; feeStructure: { name: string } };
  payments: LedgerPayment[];
};

type Props = {
  assignmentId: string | null;
  onClose: () => void;
};

export default function FeeLedgerModal({ assignmentId, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LedgerResponse | null>(null);

  useEffect(() => {
    if (!assignmentId) return;
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/admin/fees/ledger?assignmentId=${assignmentId}`
        );
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error || "Failed to load ledger.");
        }
        const payload = (await response.json()) as LedgerResponse;
        if (active) setData(payload);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load.";
        toast.error(message);
        if (active) setData(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [assignmentId]);

  if (!assignmentId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col m-4 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Fee Ledger</h3>
            <p className="text-xs text-slate-500 mt-1">
              {data?.assignment.feeStructure.name ?? ""} • {data?.assignment.class.name ?? ""}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="text-sm text-slate-500">Loading ledger...</div>
          ) : data?.payments.length ? (
            <div className="space-y-3">
              {data.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="border border-slate-200 rounded-lg p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {payment.studentName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {payment.parentName ? `Paid by ${payment.parentName}` : "Direct payment"}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-indigo-600">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{formatDate(new Date(payment.paymentDate))}</span>
                    <span className="uppercase tracking-wide">{payment.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500">No payments recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}