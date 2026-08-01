import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminLayoutClient from "@/components/AdminLayoutClient";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: LayoutProps) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login/admin");
  }

  const userForLayout = {
    name: session.user.name || "Administrator",
    email: session.user.email || "",
  };

  return (
    <AdminLayoutClient user={userForLayout}>
      {children}
    </AdminLayoutClient>
  );
}
