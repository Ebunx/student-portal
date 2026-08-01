"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function processPaymentAction(paymentId: string) {
  if (!paymentId) {
    return { success: false, message: "Invalid payment identifier." };
  }

  try {
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return { success: false, message: "Payment record not found." };
    }

    if (payment.status === "Paid") {
      return { success: false, message: "This payment has already been settled." };
    }

    // Mock processing - update status to Paid
    await db.payment.update({
      where: { id: paymentId },
      data: { status: "Paid" },
    });

    revalidatePath("/student/payments");
    revalidatePath("/student/dashboard");
    return { success: true, message: `Payment for '${payment.title}' completed successfully!` };
  } catch (error) {
    console.error("Error processing payment:", error);
    return { success: false, message: "Failed to process payment. Please try again." };
  }
}
