import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            username: z.string(),
            password: z.string(),
            role: z.enum(["STUDENT", "ADMIN"]),
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { username, password, role } = parsedCredentials.data;

        if (role === "ADMIN") {
          const admin = await db.admin.findUnique({
            where: { email: username.toLowerCase() },
          });

          if (!admin) return null;

          const passwordsMatch = await bcrypt.compare(password, admin.password);
          if (passwordsMatch) {
            return {
              id: admin.id,
              name: admin.name,
              email: admin.email,
              role: "ADMIN",
            };
          }
        } else {
          // Student login
          const student = await db.student.findUnique({
            where: { matricNumber: username.toUpperCase() },
          });

          if (!student) return null;

          const passwordsMatch = await bcrypt.compare(password, student.password);
          if (passwordsMatch) {
            return {
              id: student.matricNumber, // using matric number as id
              matricNumber: student.matricNumber,
              name: student.name,
              email: student.email,
              phone: student.phone,
              department: student.department,
              faculty: student.faculty,
              level: student.level,
              session: student.session,
              role: "STUDENT",
            };
          }
        }

        return null;
      },
    }),
  ],
});
