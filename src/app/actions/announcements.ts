"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createAnnouncementAction(title: string, content: string) {
  if (!title || !content) {
    return { success: false, message: "Please fill all required announcement fields." };
  }

  try {
    const announcement = await db.announcement.create({
      data: {
        title: title.trim(),
        content: content.trim(),
      },
    });

    revalidatePath("/student/notifications");
    revalidatePath("/student/dashboard");
    revalidatePath("/admin/announcements");
    revalidatePath("/admin/dashboard");
    return { success: true, message: "Announcement broadcasted successfully!" };
  } catch (error) {
    console.error("Error creating announcement:", error);
    return { success: false, message: "Failed to broadcast announcement. Try again." };
  }
}

export async function deleteAnnouncementAction(id: string) {
  if (!id) {
    return { success: false, message: "Announcement identifier is required." };
  }

  try {
    const announcement = await db.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      return { success: false, message: "Announcement not found." };
    }

    await db.announcement.delete({
      where: { id },
    });

    revalidatePath("/student/notifications");
    revalidatePath("/student/dashboard");
    revalidatePath("/admin/announcements");
    revalidatePath("/admin/dashboard");
    return { success: true, message: "Announcement deleted from bulletin board." };
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return { success: false, message: "Failed to delete announcement." };
  }
}
