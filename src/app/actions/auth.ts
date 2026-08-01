"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticate(
  role: "STUDENT" | "ADMIN",
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const username = formData.get("username")?.toString();
  const password = formData.get("password")?.toString();

  if (!username || !password) {
    return { error: "Please enter both fields." };
  }

  try {
    await signIn("credentials", {
      username,
      password,
      role,
      redirect: true,
      redirectTo: role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard",
    });
    return { success: true };
  } catch (error: any) {
    if (error instanceof AuthError) {
      return { error: "Invalid credentials. Please check and try again." };
    }
    // Auth.js uses redirects which throw a specific error that needs to be bubbled up
    if (error.message && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    // Also rethrow direct next/navigation redirects if encountered
    if (error.digest && error.digest.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return { error: "Authentication failed. Please verify your credentials." };
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
