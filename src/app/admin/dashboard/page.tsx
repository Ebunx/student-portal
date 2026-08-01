import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Users, BookOpen, CreditCard, Award, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import AdminDashboardCharts from "@/components/AdminDashboardCharts";

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

export default async function AdminDashboard() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login/admin");
  }

  // 1. Core Analytics Metrics
  const studentsCount = await db.student.count();
  const registrationCount = await db.registration.count();
  const pendingPaymentsCount = await db.payment.count({
    where: { status: "Pending" },
  });

  // Calculate Average CGPA and distributions
  const allStudents = await db.student.findMany({
    include: {
      results: {
        include: { course: true },
      },
      registrations: true,
    },
  });

  let gpaSum = 0;
  let studentsWithGpa = 0;

  // Initialize distribution variables
  const distribution = {
    "4.5 - 5.00 (First Class)": 0,
    "3.5 - 4.49 (Second Class Upper)": 0,
    "2.5 - 3.49 (Second Class Lower)": 0,
    "1.5 - 2.49 (Third Class)": 0,
    "0.0 - 1.49 (Fail)": 0,
  };

  // Level statistics for course registrations
  const regByLevel = {
    "100 Lvl": 0,
    "200 Lvl": 0,
    "300 Lvl": 0,
    "400 Lvl": 0,
  };

  allStudents.forEach((student) => {
    // 1. Accumulate level stats
    const regCount = student.registrations.length;
    if (student.level === 100) regByLevel["100 Lvl"] += regCount;
    else if (student.level === 200) regByLevel["200 Lvl"] += regCount;
    else if (student.level === 300) regByLevel["300 Lvl"] += regCount;
    else if (student.level === 400) regByLevel["400 Lvl"] += regCount;

    // 2. Compute individual CGPA
    let studentUnits = 0;
    let studentWeightedGP = 0;
    
    student.results.forEach((r) => {
      studentUnits += r.course.unit;
      studentWeightedGP += r.course.unit * getGP(r.grade);
    });

    if (studentUnits > 0) {
      const studentCgpa = studentWeightedGP / studentUnits;
      gpaSum += studentCgpa;
      studentsWithGpa++;

      if (studentCgpa >= 4.5) distribution["4.5 - 5.00 (First Class)"]++;
      else if (studentCgpa >= 3.5) distribution["3.5 - 4.49 (Second Class Upper)"]++;
      else if (studentCgpa >= 2.5) distribution["2.5 - 3.49 (Second Class Lower)"]++;
      else if (studentCgpa >= 1.5) distribution["1.5 - 2.49 (Third Class)"]++;
      else distribution["0.0 - 1.49 (Fail)"]++;
    }
  });

  const averageGpa = studentsWithGpa > 0 ? (gpaSum / studentsWithGpa).toFixed(2) : "0.00";

  // Reformat datasets for recharts
  const gpaData = Object.entries(distribution).map(([range, count]) => ({
    name: range.split(" ")[0], // abbreviation, e.g. "4.5"
    count,
  }));

  const levelData = Object.entries(regByLevel).map(([lvl, count]) => ({
    name: lvl,
    count,
  }));

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-900 text-white p-8 shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Admin Control Center</h1>
            <p className="text-indigo-100 max-w-lg text-sm">
              Welcome back, {session.user.name || "Administrator"}. Monitor student registration metrics, update student profiles, allocate course levels, and process academic transcripts.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-1 bg-white/10 px-4 py-2 rounded-2xl border border-white/10 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Authorized Console
          </div>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 group-hover:bg-indigo-500/10 rounded-full blur-xl transition-colors" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Enrolled</p>
              <h3 className="text-3xl font-extrabold mt-2 text-indigo-600 dark:text-indigo-400">{studentsCount}</h3>
              <p className="text-xs text-slate-500 mt-2">Active students in system</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Registered Courses count */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 group-hover:bg-violet-500/10 rounded-full blur-xl transition-colors" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Course Registrations</p>
              <h3 className="text-3xl font-extrabold mt-2 text-violet-600 dark:text-violet-400">{registrationCount}</h3>
              <p className="text-xs text-slate-500 mt-2">Active course registers</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400 flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 group-hover:bg-amber-500/10 rounded-full blur-xl transition-colors" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Payments</p>
              <h3 className="text-3xl font-extrabold mt-2 text-amber-600 dark:text-amber-400">{pendingPaymentsCount}</h3>
              <p className="text-xs text-slate-500 mt-2">Outstanding payment invoices</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Average GPA */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 group-hover:bg-emerald-500/10 rounded-full blur-xl transition-colors" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Average CGPA</p>
              <h3 className="text-3xl font-extrabold mt-2 text-emerald-600 dark:text-emerald-400">{averageGpa}</h3>
              <p className="text-xs text-slate-500 mt-2">Aggregated university standing</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <AdminDashboardCharts gpaData={gpaData} levelData={levelData} />

      {/* Quick Action Navigation Board */}
      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
          Administrative Modules
        </h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/students"
            className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all font-semibold text-sm flex flex-col gap-2 text-slate-700 dark:text-slate-350"
          >
            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>Manage Student Catalog</span>
            <span className="text-[10px] text-slate-400 font-medium">CRUD profile dossiers</span>
          </Link>
          <Link
            href="/admin/courses"
            className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all font-semibold text-sm flex flex-col gap-2 text-slate-700 dark:text-slate-350"
          >
            <BookOpen className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            <span>Manage Course Catalog</span>
            <span className="text-[10px] text-slate-400 font-medium">Edit status, units & level</span>
          </Link>
          <Link
            href="/admin/results"
            className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all font-semibold text-sm flex flex-col gap-2 text-slate-700 dark:text-slate-350"
          >
            <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>Manage Grades / Transcripts</span>
            <span className="text-[10px] text-slate-400 font-medium">Upload & edit results sheets</span>
          </Link>
          <Link
            href="/admin/announcements"
            className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all font-semibold text-sm flex flex-col gap-2 text-slate-700 dark:text-slate-350"
          >
            <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span>Manage Bulletins & Announcements</span>
            <span className="text-[10px] text-slate-400 font-medium">Write registry broadcasts</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
