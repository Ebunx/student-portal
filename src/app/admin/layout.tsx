import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import AdminLayoutClient from "@/components/AdminLayoutClient";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: LayoutProps) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login/admin");
  }

  const userForLayout = {
    name: session.name || "Administrator",
    email: session.email || "",
  };

  return (
    <AdminLayoutClient user={userForLayout}>
      {children}
    </AdminLayoutClient>
  );
}
