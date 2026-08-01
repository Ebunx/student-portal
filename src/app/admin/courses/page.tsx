import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AdminCoursesClient from "@/components/AdminCoursesClient";

export default async function AdminCoursesPage() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login/admin");
  }

  // Fetch all courses sorted by level and code
  const courses = await db.course.findMany({
    orderBy: [
      { level: "asc" },
      { code: "asc" },
    ],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Course Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Add, edit, delete, or allocate courses to academic levels and semesters
        </p>
      </div>

      <AdminCoursesClient courses={courses} />
    </div>
  );
}
