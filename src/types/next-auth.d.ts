import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    matricNumber?: string;
    phone?: string;
    department?: string;
    faculty?: string;
    level?: number;
    session?: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      matricNumber?: string;
      phone?: string;
      department?: string;
      faculty?: string;
      level?: number;
      session?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    matricNumber?: string;
    department?: string;
    faculty?: string;
    level?: number;
    session?: string;
  }
}
