import { getSession } from "@/lib/session";

// Custom wrapper to keep all existing pages compatible without modification
export async function auth() {
  const session = await getSession();
  if (!session) return null;
  return {
    user: session,
  };
}

// Dummy handler exports for compatibility if needed, or to be safe
export const handlers = {
  GET: async () => new Response("Auth endpoint inactive"),
  POST: async () => new Response("Auth endpoint inactive"),
};

export async function signIn() {}
export async function signOut() {}
