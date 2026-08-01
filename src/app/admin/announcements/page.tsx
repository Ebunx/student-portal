import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AdminAnnouncementsClient from "@/components/AdminAnnouncementsClient";

export default async function AdminAnnouncementsPage() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login/admin");
  }

  // Fetch announcements sorted by date
  const announcements = await db.announcement.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Announcements Bulletin</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Broadcast announcements, notifications, or guidelines to students
        </p>
      </div>

      <AdminAnnouncementsClient announcements={announcements} />
    </div>
  );
}
