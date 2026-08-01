"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface ResultUploadData {
  studentMatric: string;
  courseCode: string;
  score: number;
  semester: number;
  session: string;
}

function calculateGradeAndRemark(score: number) {
  let grade = "F";
  let remark = "FAIL";

  if (score >= 70) {
    grade = "A";
    remark = "PASS";
  } else if (score >= 60) {
    grade = "B";
    remark = "PASS";
  } else if (score >= 50) {
    grade = "C";
    remark = "PASS";
  } else if (score >= 45) {
    grade = "D";
    remark = "PASS";
  } else if (score >= 40) {
    grade = "E";
    remark = "PASS";
  }

  return { grade, remark };
}

export async function uploadResultAction(data: ResultUploadData) {
  if (!data.studentMatric || !data.courseCode || data.score === undefined) {
    return { success: false, message: "Please fill all required grading fields." };
  }

  const scoreNum = Number(data.score);
  if (scoreNum < 0 || scoreNum > 100) {
    return { success: false, message: "Score must be a value between 0 and 100." };
  }

  const { grade, remark } = calculateGradeAndRemark(scoreNum);

  try {
    // 1. Verify student exists
    const student = await db.student.findUnique({
      where: { matricNumber: data.studentMatric.toUpperCase().trim() },
    });

    if (!student) {
      return { success: false, message: `Student '${data.studentMatric}' not found in registry.` };
    }

    // 2. Verify course exists
    const course = await db.course.findUnique({
      where: { code: data.courseCode.toUpperCase().trim() },
    });

    if (!course) {
      return { success: false, message: `Course code '${data.courseCode}' not found in catalog.` };
    }

    // 3. Save or update score
    await db.result.upsert({
      where: {
        studentMatric_courseCode_semester_session: {
          studentMatric: data.studentMatric.toUpperCase().trim(),
          courseCode: data.courseCode.toUpperCase().trim(),
          semester: Number(data.semester),
          session: data.session.trim(),
        },
      },
      update: {
        score: scoreNum,
        grade,
        remark,
      },
      create: {
        studentMatric: data.studentMatric.toUpperCase().trim(),
        courseCode: data.courseCode.toUpperCase().trim(),
        score: scoreNum,
        grade,
        remark,
        semester: Number(data.semester),
        session: data.session.trim(),
      },
    });

    revalidatePath("/admin/results");
    revalidatePath("/student/results");
    revalidatePath("/student/dashboard");
    revalidatePath("/admin/dashboard");
    return { success: true, message: `Grade for '${data.studentMatric}' uploaded successfully!` };
  } catch (error) {
    console.error("Error uploading result:", error);
    return { success: false, message: "Failed to upload grade. Check connection." };
  }
}

export async function deleteResultAction(id: string) {
  if (!id) {
    return { success: false, message: "Result identifier is required." };
  }

  try {
    const result = await db.result.findUnique({
      where: { id },
    });

    if (!result) {
      return { success: false, message: "Grading record not found." };
    }

    await db.result.delete({
      where: { id },
    });

    revalidatePath("/admin/results");
    revalidatePath("/student/results");
    revalidatePath("/student/dashboard");
    revalidatePath("/admin/dashboard");
    return { success: true, message: "Result record deleted successfully." };
  } catch (error) {
    console.error("Error deleting result:", error);
    return { success: false, message: "Failed to delete result." };
  }
}
