import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AdminResultsClient from "@/components/AdminResultsClient";

export default async function AdminResultsPage() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login/admin");
  }

  // 1. Fetch all student results
  const results = await db.result.findMany({
    include: {
      student: { select: { name: true, matricNumber: true } },
      course: { select: { title: true, code: true } },
    },
    orderBy: [
      { session: "desc" },
      { semester: "asc" },
      { studentMatric: "asc" },
    ],
  });

  // 2. Fetch all students for options
  const students = await db.student.findMany({
    select: {
      matricNumber: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // 3. Fetch all courses for options
  const courses = await db.course.findMany({
    select: {
      code: true,
      title: true,
    },
    orderBy: {
      code: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Grades & Transcripts</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Upload exam results, edit student scores, and manage official transcripts
        </p>
      </div>

      <AdminResultsClient results={results} students={students} courses={courses} />
    </div>
  );
}
