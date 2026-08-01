import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AdminStudentsClient from "@/components/AdminStudentsClient";

export default async function AdminStudentsPage() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login/admin");
  }

  // Fetch all students ordered by name
  const students = await db.student.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Student Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Add, edit, view, or remove student accounts and enrollments
        </p>
      </div>

      <AdminStudentsClient students={students} />
    </div>
  );
}
