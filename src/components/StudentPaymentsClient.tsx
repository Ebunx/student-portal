"use client";

import React, { useState } from "react";
import { CreditCard, CheckCircle, Clock, AlertCircle, FileText, Loader2 } from "lucide-react";
import { processPaymentAction } from "@/app/actions/payments";
import { useToast } from "@/components/providers";

interface Payment {
  id: string;
  title: string;
  amount: number;
  status: string;
  createdAt: Date;
}

interface StudentPaymentsClientProps {
  payments: Payment[];
}

export default function StudentPaymentsClient({ payments }: StudentPaymentsClientProps) {
  const { success, error, info } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handlePay = async (id: string) => {
    setProcessingId(id);
    info("Connecting to secure payment gateway mockup...");
    
    try {
      const res = await processPaymentAction(id);
      if (res.success) {
        success(res.message);
      } else {
        error(res.message);
      }
    } catch (err) {
      error("An error occurred while connecting to billing services.");
    } finally {
      setProcessingId(null);
    }
  };

  // Calculations
  const paidPayments = payments.filter((p) => p.status === "Paid");
  const pendingPayments = payments.filter((p) => p.status !== "Paid");

  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amt);
  };

  return (
    <div className="space-y-6">
      {/* Cards summary */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Paid Card */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Paid Invoices</p>
              <h3 className="text-2xl font-extrabold mt-2 text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalPaid)}
              </h3>
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Settled transactions
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Outstanding Card */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Outstanding Balance</p>
              <h3 className="text-2xl font-extrabold mt-2 text-amber-600 dark:text-amber-400">
                {formatCurrency(totalPending)}
              </h3>
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-500" /> Pending settlements
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Invoice list card */}
      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
          <h3 className="text-lg font-bold">Billing Ledgers</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-150 dark:border-slate-800">
                <th className="px-6 py-4">Fee Item</th>
                <th className="px-6 py-4">Billing Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {payments.length > 0 ? (
                payments.map((p) => {
                  const isPaid = p.status === "Paid";
                  const isPaying = processingId === p.id;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{p.title}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(p.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isPaid
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
                        }`}>
                          {isPaid ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isPaid ? (
                          <button
                            onClick={() => success(`Receipt for '${p.title}' successfully loaded.`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                          >
                            <FileText className="h-3.5 w-3.5" /> Receipt
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePay(p.id)}
                            disabled={processingId !== null}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-75 cursor-pointer"
                          >
                            {isPaying ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" /> Pay...
                              </>
                            ) : (
                              "Pay Now"
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
                      <p className="font-semibold text-sm">No billing records found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
