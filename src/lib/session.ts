import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "apex_session";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  matricNumber?: string;
  phone?: string;
  department?: string;
  faculty?: string;
  level?: number;
  session?: string;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!cookie) return null;

  try {
    // Base64 decode using standard Web/Node buffer compatibility
    const decoded = Buffer.from(cookie.value, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

export async function setSession(user: SessionUser) {
  const cookieStore = await cookies();
  const encoded = Buffer.from(JSON.stringify(user)).toString("base64");
  
  cookieStore.set(SESSION_COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
