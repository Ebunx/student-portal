"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface RegisterResult {
  success: boolean;
  message: string;
}

export async function registerCoursesAction(
  studentMatric: string,
  session: string,
  semester: number,
  courseCodes: string[]
): Promise<RegisterResult> {
  if (!studentMatric || !session || !semester || !courseCodes || courseCodes.length === 0) {
    return { success: false, message: "No courses selected for registration." };
  }

  try {
    // 1. Fetch courses to calculate unit total
    const courses = await db.course.findMany({
      where: {
        code: { in: courseCodes },
      },
    });

    const totalUnits = courses.reduce((sum, c) => sum + c.unit, 0);

    // 2. Validate max units limit (e.g. 24 units)
    if (totalUnits > 24) {
      return {
        success: false,
        message: `Registration failed. Total units (${totalUnits}) exceeds the maximum credit limit of 24 units.`,
      };
    }

    // 3. Save registrations in a transaction
    await db.$transaction(async (tx) => {
      // Clear any temporary or existing registration for this student/semester/session first
      await tx.registration.deleteMany({
        where: {
          studentMatric,
          semester,
          session,
        },
      });

      // Insert new registrations
      const registrationData = courseCodes.map((code) => ({
        studentMatric,
        courseCode: code,
        semester,
        session,
      }));

      await tx.registration.createMany({
        data: registrationData,
      });
    });

    revalidatePath("/student/courses");
    revalidatePath("/student/dashboard");
    return { success: true, message: "Course registration completed successfully!" };
  } catch (error: any) {
    console.error("Error registering courses:", error);
    return {
      success: false,
      message: "An error occurred during course registration. Please try again.",
    };
  }
}
