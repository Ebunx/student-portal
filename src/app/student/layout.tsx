import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import StudentLayoutClient from "@/components/StudentLayoutClient";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function StudentLayout({ children }: LayoutProps) {
  const session = await getSession();

  if (!session || session.role !== "STUDENT") {
    redirect("/login/student");
  }

  const userForLayout = {
    name: session.name || "Student",
    matricNumber: session.matricNumber || "",
    department: session.department || "",
  };

  return (
    <StudentLayoutClient user={userForLayout}>
      {children}
    </StudentLayoutClient>
  );
}
