import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import StudentCoursesClient from "@/components/StudentCoursesClient";

export default async function StudentCoursesPage() {
  const session = await auth();

  if (!session || session.user.role !== "STUDENT" || !session.user.matricNumber) {
    redirect("/login/student");
  }

  // 1. Fetch student
  const student = await db.student.findUnique({
    where: { matricNumber: session.user.matricNumber },
  });

  if (!student) {
    redirect("/login/student");
  }

  // Assume Semester 1 is the currently active course registration semester
  const activeSemester = 1;

  // 2. Fetch courses available for the student's level and active semester
  const availableCourses = await db.course.findMany({
    where: {
      level: student.level,
      semester: activeSemester,
    },
    orderBy: {
      code: "asc",
    },
  });

  // 3. Fetch existing registrations (if any)
  const existingRegistrations = await db.registration.findMany({
    where: {
      studentMatric: student.matricNumber,
      session: student.session,
      semester: activeSemester,
    },
    include: {
      course: true,
    },
  });

  // Shape student properties safely
  const studentData = {
    matricNumber: student.matricNumber,
    name: student.name,
    department: student.department,
    faculty: student.faculty,
    level: student.level,
    session: student.session,
  };

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <h1 className="text-3xl font-extrabold tracking-tight">Course Registration</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Register courses for the current academic semester
        </p>
      </div>

      <StudentCoursesClient
        availableCourses={availableCourses}
        existingRegistrations={existingRegistrations}
        student={studentData}
        activeSemester={activeSemester}
      />
    </div>
  );
}
