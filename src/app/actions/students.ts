"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export interface StudentFormData {
  matricNumber: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  faculty: string;
  level: number;
  session: string;
  password?: string;
}

export async function createStudentAction(data: StudentFormData) {
  if (!data.matricNumber || !data.name || !data.email || !data.password) {
    return { success: false, message: "Please fill all required fields." };
  }

  try {
    // Check if matric already exists
    const existingMatric = await db.student.findUnique({
      where: { matricNumber: data.matricNumber.toUpperCase() },
    });

    if (existingMatric) {
      return { success: false, message: "Matric number already exists in system." };
    }

    // Check if email already exists
    const existingEmail = await db.student.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingEmail) {
      return { success: false, message: "Email address already registered." };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create student
    await db.student.create({
      data: {
        matricNumber: data.matricNumber.toUpperCase(),
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone,
        department: data.department,
        faculty: data.faculty,
        level: Number(data.level),
        session: data.session,
        password: hashedPassword,
      },
    });

    // Mock corresponding Payments (Standard default fee setup for new student)
    await db.payment.createMany({
      data: [
        { studentMatric: data.matricNumber.toUpperCase(), title: "Acceptance Fee", amount: 25000.0, status: "Paid" },
        { studentMatric: data.matricNumber.toUpperCase(), title: "School Fees", amount: 150000.0, status: "Pending" },
        { studentMatric: data.matricNumber.toUpperCase(), title: "Medical Fee", amount: 10000.0, status: "Pending" },
      ],
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/dashboard");
    return { success: true, message: `Student '${data.name}' created and enrolled successfully!` };
  } catch (error: any) {
    console.error("Error creating student:", error);
    return { success: false, message: "Failed to create student. Check inputs and try again." };
  }
}

export async function updateStudentAction(matricNumber: string, data: Omit<StudentFormData, "password"> & { password?: string }) {
  if (!matricNumber) {
    return { success: false, message: "Matric number is required." };
  }

  try {
    const student = await db.student.findUnique({
      where: { matricNumber },
    });

    if (!student) {
      return { success: false, message: "Student record not found." };
    }

    // Verify email uniqueness if changed
    if (data.email.toLowerCase() !== student.email) {
      const existingEmail = await db.student.findUnique({
        where: { email: data.email.toLowerCase() },
      });
      if (existingEmail) {
        return { success: false, message: "Email address is already in use by another student." };
      }
    }

    const updateData: any = {
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      department: data.department,
      faculty: data.faculty,
      level: Number(data.level),
      session: data.session,
    };

    // If new password is provided, hash it and update it
    if (data.password && data.password.trim() !== "") {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    await db.student.update({
      where: { matricNumber },
      data: updateData,
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/dashboard");
    return { success: true, message: `Student '${data.name}' profile updated successfully!` };
  } catch (error: any) {
    console.error("Error updating student:", error);
    return { success: false, message: "Failed to update student profile. Check inputs." };
  }
}

export async function deleteStudentAction(matricNumber: string) {
  if (!matricNumber) {
    return { success: false, message: "Matric number is required." };
  }

  try {
    const student = await db.student.findUnique({
      where: { matricNumber },
    });

    if (!student) {
      return { success: false, message: "Student record not found." };
    }

    await db.student.delete({
      where: { matricNumber },
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/dashboard");
    return { success: true, message: "Student record deleted successfully from registers." };
  } catch (error: any) {
    console.error("Error deleting student:", error);
    return { success: false, message: "Failed to delete student record." };
  }
}
