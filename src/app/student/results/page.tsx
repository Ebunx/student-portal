import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import StudentResultsClient from "@/components/StudentResultsClient";

export default async function StudentResultsPage() {
  const session = await auth();

  if (!session || session.user.role !== "STUDENT" || !session.user.matricNumber) {
    redirect("/login/student");
  }

  const student = await db.student.findUnique({
    where: { matricNumber: session.user.matricNumber },
  });

  if (!student) {
    redirect("/login/student");
  }

  // Fetch results and include course info
  const results = await db.result.findMany({
    where: { studentMatric: student.matricNumber },
    include: {
      course: true,
    },
  });

  // Shape user profile properties safely
  const studentData = {
    name: student.name,
    matricNumber: student.matricNumber,
    department: student.department,
    faculty: student.faculty,
    level: student.level,
    session: student.session,
  };

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <h1 className="text-3xl font-extrabold tracking-tight">Academic Results</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Verify grading results, transcripts, and GPA standings
        </p>
      </div>
      <StudentResultsClient results={results} student={studentData} />
    </div>
  );
}
