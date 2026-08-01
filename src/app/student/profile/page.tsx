import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { User, Mail, Phone, GraduationCap, MapPin, Calendar, Clock, Award } from "lucide-react";

export default async function StudentProfilePage() {
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

  const profileItems = [
    { label: "Matric Number", value: student.matricNumber, icon: Award, color: "text-indigo-600 dark:text-indigo-400" },
    { label: "Email Address", value: student.email, icon: Mail, color: "text-blue-600 dark:text-blue-400" },
    { label: "Phone Number", value: student.phone, icon: Phone, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Faculty", value: `Faculty of ${student.faculty}`, icon: GraduationCap, color: "text-purple-600 dark:text-purple-400" },
    { label: "Department", value: student.department, icon: MapPin, color: "text-rose-600 dark:text-rose-400" },
    { label: "Academic Level", value: `${student.level} Level`, icon: Clock, color: "text-amber-600 dark:text-amber-400" },
    { label: "Current Session", value: `${student.session} Session`, icon: Calendar, color: "text-violet-600 dark:text-violet-400" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Student Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Official academic enrollment dossier</p>
      </div>

      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {/* Header decoration */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative" />
        
        {/* Profile Card Contents */}
        <div className="px-8 pb-8 relative">
          {/* Avatar and name header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 mb-8 text-center sm:text-left">
            <div className="h-32 w-32 rounded-3xl border-4 border-white dark:border-[#0b0f19] bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-md shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={student.passportUrl}
                alt={student.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-1 py-1">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{student.name}</h2>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 items-center text-slate-500 dark:text-slate-400">
                <span className="text-sm font-semibold">{student.department}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-900/30">
                  {student.matricNumber}
                </span>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800/80 my-6" />

          {/* Details list */}
          <div className="grid sm:grid-cols-2 gap-6">
            {profileItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-2xl border border-slate-50 dark:border-slate-900/10 bg-slate-50/20 dark:bg-slate-900/5"
                >
                  <div className={`p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {item.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
