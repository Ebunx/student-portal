import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Bell, Calendar, Megaphone, User } from "lucide-react";

export default async function StudentNotificationsPage() {
  const session = await auth();

  if (!session || session.user.role !== "STUDENT") {
    redirect("/login/student");
  }

  // Fetch announcements
  const announcements = await db.announcement.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Announcements Bulletin</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Stay up to date with updates from the university administration
        </p>
      </div>

      <div className="space-y-4">
        {announcements.length > 0 ? (
          announcements.map((ann) => (
            <div
              key={ann.id}
              className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Corner Accent indicator */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600 dark:bg-indigo-400" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Megaphone className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  {ann.title}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-450 font-semibold">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(ann.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              
              <p className="text-sm text-slate-650 dark:text-slate-305 leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-50 dark:border-slate-900/50 text-xs text-slate-400 font-medium">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Published by: Registry Office</span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center">
            <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                <Bell className="h-6 w-6" />
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-200">No Announcements Found</p>
              <p className="text-xs text-slate-500 mt-2">
                There are currently no announcements posted on the board. Check back later for updates.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
