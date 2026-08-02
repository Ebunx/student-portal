"use server";

import { db } from "@/lib/db";
import { setSession, deleteSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function authenticate(
  role: "STUDENT" | "ADMIN",
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!username || !password) {
    return { error: "Please enter both fields." };
  }

  let redirectTo = "/";

  try {
    if (role === "ADMIN") {
      const admin = await db.admin.findUnique({
        where: { email: username.toLowerCase() },
      });

      if (!admin) {
        return { error: "Invalid email or password." };
      }

      const passwordsMatch = await bcrypt.compare(password, admin.password);
      if (!passwordsMatch) {
        return { error: "Invalid email or password." };
      }

      // Set cookie session
      await setSession({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: "ADMIN",
      });
      
      redirectTo = "/admin/dashboard";
    } else {
      // Student login
      const student = await db.student.findUnique({
        where: { matricNumber: username.toUpperCase() },
      });

      if (!student) {
        return { error: "Invalid matric number or password." };
      }

      const passwordsMatch = await bcrypt.compare(password, student.password);
      if (!passwordsMatch) {
        return { error: "Invalid matric number or password." };
      }

      // Set cookie session
      await setSession({
        id: student.matricNumber,
        matricNumber: student.matricNumber,
        name: student.name,
        email: student.email,
        phone: student.phone,
        department: student.department,
        faculty: student.faculty,
        level: student.level,
        session: student.session,
        role: "STUDENT",
      });

      redirectTo = "/student/dashboard";
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return { error: "An unexpected database authentication error occurred." };
  }

  // Perform redirect OUTSIDE the try-catch block
  redirect(redirectTo);
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
