import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  FileSpreadsheet,
  Award,
  Bell,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar
} from "lucide-react";

function getGP(grade: string): number {
  switch (grade.toUpperCase()) {
    case "A": return 5;
    case "B": return 4;
    case "C": return 3;
    case "D": return 2;
    case "E": return 1;
    case "F": return 0;
    default: return 0;
  }
}

export default async function StudentDashboard() {
  const session = await auth();

  if (!session || session.user.role !== "STUDENT" || !session.user.matricNumber) {
    redirect("/login/student");
  }

  const matric = session.user.matricNumber;

  // 1. Fetch Student Details
  const student = await db.student.findUnique({
    where: { matricNumber: matric },
  });

  if (!student) {
    redirect("/login/student");
  }

  // 2. Fetch Results for CGPA calculation
  const results = await db.result.findMany({
    where: { studentMatric: matric },
    include: { course: true },
  });

  // Calculate CGPA
  let totalUnits = 0;
  let totalWeightedGP = 0;
  
  results.forEach((r) => {
    totalUnits += r.course.unit;
    totalWeightedGP += r.course.unit * getGP(r.grade);
  });

  const cgpa = totalUnits > 0 ? (totalWeightedGP / totalUnits).toFixed(2) : "0.00";

  // Calculate current Semester GPA (e.g. results in current level/semester)
  // Let's find results in the most recent semester that has graded courses
  const semestersWithResults = Array.from(new Set(results.map(r => `${r.session}-${r.semester}`)));
  let semesterGpa = "0.00";
  if (semestersWithResults.length > 0) {
    // get results of latest semester
    const sortedSemesters = semestersWithResults.sort().reverse();
    const latestSemKey = sortedSemesters[0];
    const [latestSess, latestSem] = latestSemKey.split("-");
    
    const latestResults = results.filter(r => r.session === latestSess && r.semester === parseInt(latestSem));
    let semUnits = 0;
    let semWeightedGP = 0;
    latestResults.forEach(r => {
      semUnits += r.course.unit;
      semWeightedGP += r.course.unit * getGP(r.grade);
    });
    semesterGpa = semUnits > 0 ? (semWeightedGP / semUnits).toFixed(2) : "0.00";
  }

  // 3. Count Registered Courses in current semester/session
  const registeredCount = await db.registration.count({
    where: {
      studentMatric: matric,
      session: student.session,
    },
  });

  // 4. Fetch Announcements
  const announcements = await db.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white p-8 shadow-lg">
        {/* Glow overlay */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {student.name}!</h1>
            <p className="text-indigo-100 max-w-lg text-sm">
              Manage your semester course sheet, check grading scripts, and review university billing histories.
            </p>
            <div className="flex flex-wrap gap-4 mt-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 px-3 py-1.5 rounded-full">
                <MapPin className="h-3.5 w-3.5" /> {student.department}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 px-3 py-1.5 rounded-full">
                <GraduationCap className="h-3.5 w-3.5" /> Faculty of {student.faculty}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 px-3 py-1.5 rounded-full">
                <Calendar className="h-3.5 w-3.5" /> Level {student.level} | {student.session} Session
              </div>
            </div>
          </div>
          <div className="shrink-0">
            <Link
              href="/student/profile"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-700 font-bold hover:bg-indigo-50 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
            >
              View Profile Info
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CGPA */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 group-hover:bg-indigo-500/10 rounded-full blur-xl transition-colors" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Cumulative GPA</p>
              <h3 className="text-3xl font-extrabold mt-2 text-indigo-600 dark:text-indigo-400">{cgpa}</h3>
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> Out of 5.00
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Semester GPA */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 group-hover:bg-violet-500/10 rounded-full blur-xl transition-colors" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Semester GPA</p>
              <h3 className="text-3xl font-extrabold mt-2 text-violet-600 dark:text-violet-400">{semesterGpa}</h3>
              <p className="text-xs text-slate-500 mt-2">Latest graded semester</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400 flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Registered Courses */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 group-hover:bg-purple-500/10 rounded-full blur-xl transition-colors" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Courses</p>
              <h3 className="text-3xl font-extrabold mt-2 text-purple-600 dark:text-purple-400">{registeredCount}</h3>
              <p className="text-xs text-slate-500 mt-2">Active in current session</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Current Level */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 group-hover:bg-emerald-500/10 rounded-full blur-xl transition-colors" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Academic Standing</p>
              <h3 className="text-3xl font-extrabold mt-2 text-emerald-600 dark:text-emerald-400">{student.level} Lvl</h3>
              <p className="text-xs text-slate-500 mt-2">Good Standing</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Layout - Dashboard panels */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Announcements / Notifications list */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Latest Announcements
            </h3>
            <Link
              href="/student/notifications"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              See All
            </Link>
          </div>

          <div className="flex-1 space-y-4">
            {announcements.length > 0 ? (
              announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 hover:border-slate-200 dark:hover:border-slate-700/60 transition-colors"
                >
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{ann.title}</h4>
                    <span className="text-[10px] shrink-0 text-slate-400 font-semibold">
                      {new Date(ann.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed line-clamp-2">
                    {ann.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <Bell className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-sm font-medium text-slate-400">No active announcements</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links / Tasks */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              href="/student/courses"
              className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 dark:hover:border-indigo-400/30 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all font-medium text-sm text-slate-700 dark:text-slate-300"
            >
              Register Courses
              <ChevronRightIcon className="h-4 w-4 text-slate-400" />
            </Link>
            <Link
              href="/student/results"
              className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 dark:hover:border-indigo-400/30 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all font-medium text-sm text-slate-700 dark:text-slate-300"
            >
              Verify Result Sheets
              <ChevronRightIcon className="h-4 w-4 text-slate-400" />
            </Link>
            <Link
              href="/student/payments"
              className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 dark:hover:border-indigo-400/30 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all font-medium text-sm text-slate-700 dark:text-slate-300"
            >
              Settle Semester Invoices
              <ChevronRightIcon className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
