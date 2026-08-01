"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, CheckCircle, AlertTriangle, Printer, FileText, Plus, Check } from "lucide-react";
import { registerCoursesAction } from "@/app/actions/courses";
import { useToast } from "@/components/providers";

interface Course {
  code: string;
  title: string;
  unit: number;
  status: string;
  level: number;
  semester: number;
}

interface Registration {
  id: string;
  courseCode: string;
  course: Course;
}

interface Student {
  matricNumber: string;
  name: string;
  department: string;
  faculty: string;
  level: number;
  session: string;
}

interface StudentCoursesClientProps {
  availableCourses: Course[];
  existingRegistrations: Registration[];
  student: Student;
  activeSemester: number;
}

export default function StudentCoursesClient({
  availableCourses,
  existingRegistrations,
  student,
  activeSemester,
}: StudentCoursesClientProps) {
  const { success, error, info } = useToast();
  
  const [isEditing, setIsEditing] = useState(existingRegistrations.length === 0);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize selected courses if existing registrations exist
  useEffect(() => {
    if (existingRegistrations.length > 0) {
      setSelectedCodes(existingRegistrations.map((r) => r.courseCode));
    } else {
      // By default, select CORE courses
      const cores = availableCourses.filter((c) => c.status === "CORE").map((c) => c.code);
      setSelectedCodes(cores);
    }
  }, [existingRegistrations, availableCourses]);

  // Calculate current total units
  const totalUnits = availableCourses
    .filter((c) => selectedCodes.includes(c.code))
    .reduce((sum, c) => sum + c.unit, 0);

  const handleToggleCourse = (code: string) => {
    setSelectedCodes((prev) => {
      if (prev.includes(code)) {
        return prev.filter((c) => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  const handleRegister = async () => {
    if (selectedCodes.length === 0) {
      error("Please select at least one course.");
      return;
    }

    if (totalUnits > 24) {
      error(`Cannot exceed the 24-unit semester limit. Current: ${totalUnits} units.`);
      return;
    }

    setIsSubmitting(true);
    info("Submitting registration course list...");
    
    try {
      const res = await registerCoursesAction(
        student.matricNumber,
        student.session,
        activeSemester,
        selectedCodes
      );

      if (res.success) {
        success(res.message);
        setIsEditing(false);
      } else {
        error(res.message);
      }
    } catch (err) {
      error("An unexpected error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
    success("Print command triggered.");
  };

  // 1. View: Registered Slip (Receipt)
  if (!isEditing && existingRegistrations.length > 0) {
    const slipTotalUnits = existingRegistrations.reduce((sum, r) => sum + r.course.unit, 0);

    return (
      <div className="space-y-6">
        {/* Header toolbar */}
        <div className="flex justify-between items-center bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm print:hidden">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-semibold">Course registration is locked and submitted.</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-sm font-semibold transition-colors cursor-pointer"
            >
              Modify Courses
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              Print Slip
            </button>
          </div>
        </div>

        {/* The slip paper */}
        <div
          id="print-area"
          className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm print:border-none print:shadow-none print:p-0"
        >
          {/* Slip Header */}
          <div className="flex flex-col items-center text-center pb-6 mb-8 border-b-2 border-slate-300">
            <h1 className="text-2xl font-black text-slate-950">APEX UNIVERSITY COURSE REGISTRATION</h1>
            <p className="text-sm font-bold text-slate-500 mt-1">OFFICIAL SEMESTER REGISTRATION SLIP</p>
          </div>

          {/* Student specs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl mb-8 print:bg-white print:border-slate-300 print:text-black">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Student Name</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 print:text-black mt-1">{student.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Matric Number</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 print:text-black mt-1">{student.matricNumber}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Session/Term</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 print:text-black mt-1">
                {student.session} | Sem {activeSemester}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Academic Level</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 print:text-black mt-1">{student.level} Level</p>
            </div>
          </div>

          {/* Registrations List */}
          <div className="overflow-x-auto border border-slate-150 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse text-sm print:text-black">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-150 dark:border-slate-800 print:bg-white print:border-slate-300 print:text-black">
                  <th className="px-6 py-4">Course Code</th>
                  <th className="px-6 py-4">Course Title</th>
                  <th className="px-6 py-4 text-center">Units</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-slate-300">
                {existingRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                    <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400 print:text-black">{reg.courseCode}</td>
                    <td className="px-6 py-4 font-medium">{reg.course.title}</td>
                    <td className="px-6 py-4 text-center font-semibold">{reg.course.unit}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        reg.course.status === "CORE"
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30"
                          : "bg-slate-50 text-slate-700 dark:bg-slate-800/40 dark:text-slate-400 border border-slate-200 dark:border-slate-750"
                      }`}>
                        {reg.course.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Credits Tally */}
          <div className="flex justify-between items-center mt-6 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30 print:bg-white print:border-slate-300">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Registered Units</span>
            <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 print:text-black">
              {slipTotalUnits} Units
            </span>
          </div>

          {/* Authorized Signature spacer for print */}
          <div className="hidden print:flex justify-between items-end mt-24">
            <div className="flex flex-col items-center">
              <div className="w-48 border-b border-slate-400 mb-2" />
              <p className="text-xs text-slate-500">Student Signature</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-48 border-b border-slate-400 mb-2" />
              <p className="text-xs text-slate-500">Head of Department</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. View: Course registration select check sheet
  return (
    <div className="space-y-6">
      {/* Registration Stats Banner */}
      <div className="grid md:grid-cols-3 gap-6 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="space-y-1">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tally Units Selected</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${totalUnits > 24 ? "text-rose-600" : "text-indigo-600 dark:text-indigo-400"}`}>
              {totalUnits}
            </span>
            <span className="text-sm text-slate-500">/ 24 maximum units</span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Academic Term</p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
            {student.session} Session | Semester {activeSemester}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {totalUnits > 24 ? (
            <div className="flex items-start gap-2 text-rose-600 dark:text-rose-400 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-xs leading-relaxed">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Unit limit exceeded. You must deselect some courses to register.</span>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-indigo-600 dark:text-indigo-400 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-xs leading-relaxed">
              <BookOpen className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Select core courses and desired electives, then press submit.</span>
            </div>
          )}
        </div>
      </div>

      {/* Course List Card */}
      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
          <h3 className="text-lg font-bold">Course Checklist</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-150 dark:border-slate-800">
                <th className="px-6 py-4 w-12 text-center">Select</th>
                <th className="px-6 py-4">Course Code</th>
                <th className="px-6 py-4">Course Title</th>
                <th className="px-6 py-4 text-center">Units</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {availableCourses.map((c) => {
                const isSelected = selectedCodes.includes(c.code);
                const isCore = c.status === "CORE";
                return (
                  <tr
                    key={c.code}
                    onClick={() => handleToggleCourse(c.code)}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/20 cursor-pointer transition-colors ${
                      isSelected ? "bg-indigo-50/20 dark:bg-indigo-950/10" : ""
                    }`}
                  >
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleCourse(c.code)}
                        className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-slate-300 dark:border-slate-700 hover:border-slate-400"
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">{c.code}</td>
                    <td className="px-6 py-4 font-medium">{c.title}</td>
                    <td className="px-6 py-4 text-center font-semibold">{c.unit}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isCore
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30"
                          : "bg-slate-50 text-slate-700 dark:bg-slate-800/40 dark:text-slate-400 border border-slate-200 dark:border-slate-750"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Submission Action */}
      <div className="flex justify-end gap-3">
        {existingRegistrations.length > 0 && (
          <button
            onClick={() => setIsEditing(false)}
            className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 font-semibold text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleRegister}
          disabled={isSubmitting || totalUnits > 24 || selectedCodes.length === 0}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/15 transition-all disabled:opacity-75 cursor-pointer"
        >
          {isSubmitting ? "Submitting..." : "Submit Registration Slip"}
        </button>
      </div>
    </div>
  );
}
