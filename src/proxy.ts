import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "apex_session";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let user: any = null;
  
  if (cookie) {
    try {
      // Base64 decode using standard Edge-compatible Web API
      const decoded = atob(cookie);
      user = JSON.parse(decoded);
    } catch (e) {
      // Invalidate if parsing fails
    }
  }

  const isLoggedIn = !!user;
  const isStudentPage = pathname.startsWith("/student");
  const isAdminPage = pathname.startsWith("/admin");
  const isLoginPage = pathname.startsWith("/login");

  if (isStudentPage) {
    if (isLoggedIn && user.role === "STUDENT") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login/student", request.url));
  }

  if (isAdminPage) {
    if (isLoggedIn && user.role === "ADMIN") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login/admin", request.url));
  }

  if (isLoginPage && isLoggedIn) {
    if (user.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/admin/:path*", "/login/:path*"],
};
