import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isStudentPage = nextUrl.pathname.startsWith("/student");
      const isAdminPage = nextUrl.pathname.startsWith("/admin");

      if (isStudentPage) {
        if (isLoggedIn && auth.user.role === "STUDENT") return true;
        return Response.redirect(new URL("/login/student", nextUrl));
      }

      if (isAdminPage) {
        if (isLoggedIn && auth.user.role === "ADMIN") return true;
        return Response.redirect(new URL("/login/admin", nextUrl));
      }

      // If logged in and trying to go to login pages, redirect to respective dashboard
      if (isLoggedIn) {
        if (nextUrl.pathname.startsWith("/login")) {
          if (auth.user.role === "ADMIN") {
            return Response.redirect(new URL("/admin/dashboard", nextUrl));
          } else {
            return Response.redirect(new URL("/student/dashboard", nextUrl));
          }
        }
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.matricNumber = user.matricNumber;
        token.email = user.email;
        token.name = user.name;
        token.department = user.department;
        token.faculty = user.faculty;
        token.level = user.level;
        token.session = user.session;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.matricNumber = token.matricNumber as string | undefined;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.department = token.department as string | undefined;
        session.user.faculty = token.faculty as string | undefined;
        session.user.level = token.level as number | undefined;
        session.user.session = token.session as string | undefined;
      }
      return session;
    },
  },
  providers: [], // Declared in auth.ts
} satisfies NextAuthConfig;
