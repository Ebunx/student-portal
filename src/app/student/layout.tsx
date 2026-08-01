import { auth } from "@/auth";
import { redirect } from "next/navigation";
import StudentLayoutClient from "@/components/StudentLayoutClient";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function StudentLayout({ children }: LayoutProps) {
  const session = await auth();

  if (!session || session.user.role !== "STUDENT") {
    redirect("/login/student");
  }

  const userForLayout = {
    name: session.user.name || "Student",
    matricNumber: session.user.matricNumber || "",
    department: session.user.department || "",
  };

  return (
    <StudentLayoutClient user={userForLayout}>
      {children}
    </StudentLayoutClient>
  );
}
