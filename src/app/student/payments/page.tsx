import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import StudentPaymentsClient from "@/components/StudentPaymentsClient";

export default async function StudentPaymentsPage() {
  const session = await auth();

  if (!session || session.user.role !== "STUDENT" || !session.user.matricNumber) {
    redirect("/login/student");
  }

  // Fetch payments for this student
  const payments = await db.payment.findMany({
    where: {
      studentMatric: session.user.matricNumber,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Billing & Payments</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review financial statements and pay outstanding semester invoices
        </p>
      </div>

      <StudentPaymentsClient payments={payments} />
    </div>
  );
}
