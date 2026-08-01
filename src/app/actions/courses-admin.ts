"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface CourseFormData {
  code: string;
  title: string;
  unit: number;
  status: string; // "CORE" | "ELECTIVE"
  level: number; // 100, 200, 300, 400
  semester: number; // 1 | 2
}

export async function createCourseAction(data: CourseFormData) {
  if (!data.code || !data.title || !data.unit || !data.status) {
    return { success: false, message: "Please fill all required fields." };
  }

  try {
    const existing = await db.course.findUnique({
      where: { code: data.code.toUpperCase().trim() },
    });

    if (existing) {
      return { success: false, message: `Course code '${data.code}' is already registered.` };
    }

    await db.course.create({
      data: {
        code: data.code.toUpperCase().trim(),
        title: data.title.trim(),
        unit: Number(data.unit),
        status: data.status,
        level: Number(data.level),
        semester: Number(data.semester),
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath("/student/courses");
    revalidatePath("/admin/dashboard");
    return { success: true, message: `Course '${data.code}' created successfully!` };
  } catch (error) {
    console.error("Error creating course:", error);
    return { success: false, message: "Failed to create course. Try again." };
  }
}

export async function updateCourseAction(code: string, data: Omit<CourseFormData, "code">) {
  if (!code) {
    return { success: false, message: "Course code is required." };
  }

  try {
    const course = await db.course.findUnique({
      where: { code },
    });

    if (!course) {
      return { success: false, message: "Course not found." };
    }

    await db.course.update({
      where: { code },
      data: {
        title: data.title.trim(),
        unit: Number(data.unit),
        status: data.status,
        level: Number(data.level),
        semester: Number(data.semester),
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath("/student/courses");
    revalidatePath("/admin/dashboard");
    return { success: true, message: `Course '${code}' updated successfully!` };
  } catch (error) {
    console.error("Error updating course:", error);
    return { success: false, message: "Failed to update course." };
  }
}

export async function deleteCourseAction(code: string) {
  if (!code) {
    return { success: false, message: "Course code is required." };
  }

  try {
    const course = await db.course.findUnique({
      where: { code },
    });

    if (!course) {
      return { success: false, message: "Course not found." };
    }

    await db.course.delete({
      where: { code },
    });

    revalidatePath("/admin/courses");
    revalidatePath("/student/courses");
    revalidatePath("/admin/dashboard");
    return { success: true, message: `Course '${code}' deleted from registers.` };
  } catch (error) {
    console.error("Error deleting course:", error);
    return { success: false, message: "Failed to delete course." };
  }
}
