"use client";

import React, { useState } from "react";
import { Printer, Download, FileText, ChevronDown, CheckCircle } from "lucide-react";
import { useToast } from "@/components/providers";

interface Course {
  code: string;
  title: string;
  unit: number;
  status: string;
}

interface Result {
  id: string;
  courseCode: string;
  score: number;
  grade: string;
  remark: string;
  semester: number;
  session: string;
  course: Course;
}

interface Student {
  name: string;
  matricNumber: string;
  department: string;
  faculty: string;
  level: number;
  session: string;
}

interface StudentResultsClientProps {
  results: Result[];
  student: Student;
}

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

export default function StudentResultsClient({ results, student }: StudentResultsClientProps) {
  const { success, info } = useToast();
  
  // Extract all sessions represented in the results
  const availableSessions = Array.from(new Set(results.map((r) => r.session))).sort().reverse();
  const defaultSession = availableSessions[0] || student.session;
  
  const [selectedSession, setSelectedSession] = useState<string>(defaultSession);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  // Filter results by selected session & semester
  const filteredResults = results.filter(
    (r) => r.session === selectedSession && r.semester === selectedSemester
  );

  // Calculate Semester GPA
  let semUnits = 0;
  let semWeightedGP = 0;
  filteredResults.forEach((r) => {
    semUnits += r.course.unit;
    semWeightedGP += r.course.unit * getGP(r.grade);
  });
  const semesterGpa = semUnits > 0 ? (semWeightedGP / semUnits).toFixed(2) : "0.00";

  // Calculate Cumulative GPA (cumulative up to the selected session/semester)
  // Let's filter all results up to (and including) the selected session and semester
  // To compare sessions chronologically: we can sort them
  const allSessionsOrdered = Array.from(new Set(results.map((r) => r.session))).sort();
  const selectedSessIdx = allSessionsOrdered.indexOf(selectedSession);

  const cumulativeResults = results.filter((r) => {
    const rSessIdx = allSessionsOrdered.indexOf(r.session);
    if (rSessIdx < selectedSessIdx) return true;
    if (rSessIdx === selectedSessIdx && r.semester <= selectedSemester) return true;
    return false;
  });

  let cumUnits = 0;
  let cumWeightedGP = 0;
  cumulativeResults.forEach((r) => {
    cumUnits += r.course.unit;
    cumWeightedGP += r.course.unit * getGP(r.grade);
  });
  const cumulativeGpa = cumUnits > 0 ? (cumWeightedGP / cumUnits).toFixed(2) : "0.00";

  const handlePrint = () => {
    window.print();
    success("Print dialog opened successfully.");
  };

  const handleDownloadPdf = () => {
    setIsPdfGenerating(true);
    info("Preparing transcript PDF. Please wait...");
    setTimeout(() => {
      window.print();
      setIsPdfGenerating(false);
      success("PDF generated successfully.");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Selection Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Session Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Academic Session</label>
            <div className="relative">
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="appearance-none block w-44 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-semibold pr-8 cursor-pointer"
              >
                {availableSessions.length > 0 ? (
                  availableSessions.map((sess) => (
                    <option key={sess} value={sess}>
                      {sess} Session
                    </option>
                  ))
                ) : (
                  <option value={student.session}>{student.session} Session</option>
                )}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Semester Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Semester</label>
            <div className="relative">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
                className="appearance-none block w-40 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-semibold pr-8 cursor-pointer"
              >
                <option value={1}>First Semester</option>
                <option value={2}>Second Semester</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 font-semibold text-sm transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            Print Slip
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isPdfGenerating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-75 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            {isPdfGenerating ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* Official slip container (this will be focused during window.print()) */}
      <div
        id="print-area"
        className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm print:border-none print:shadow-none print:p-0"
      >
        {/* Official Header for print slip */}
        <div className="hidden print:flex flex-col items-center text-center pb-6 mb-8 border-b-2 border-slate-300">
          <h1 className="text-2xl font-black tracking-tight text-slate-950">APEX UNIVERSITY ACADEMIC TRANSCRIPT</h1>
          <p className="text-sm font-bold text-slate-500 mt-1">OFFICIAL ACADEMIC RECORD SLIP</p>
        </div>

        {/* Student details header (always visible) */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl mb-8 print:bg-white print:border-slate-300 print:text-black">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Name of Student</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 print:text-black mt-1">{student.name}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Matric Number</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 print:text-black mt-1">{student.matricNumber}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 print:text-black mt-1">{student.department}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selected Term</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 print:text-black mt-1">
              {selectedSession} - Sem {selectedSemester}
            </p>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto border border-slate-150 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-left border-collapse text-sm print:text-black">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-150 dark:border-slate-800 print:bg-white print:border-slate-300 print:text-black">
                <th className="px-6 py-4">Course Code</th>
                <th className="px-6 py-4">Course Title</th>
                <th className="px-6 py-4 text-center">Units</th>
                <th className="px-6 py-4 text-center">Score</th>
                <th className="px-6 py-4 text-center">Grade</th>
                <th className="px-6 py-4 text-center">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-slate-300">
              {filteredResults.length > 0 ? (
                filteredResults.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 print:hover:bg-white">
                    <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400 print:text-black">{r.courseCode}</td>
                    <td className="px-6 py-4 font-medium">{r.course.title}</td>
                    <td className="px-6 py-4 text-center font-semibold">{r.course.unit}</td>
                    <td className="px-6 py-4 text-center font-semibold">{r.score}</td>
                    <td className="px-6 py-4 text-center font-black">
                      <span className={`px-2 py-1 rounded text-xs ${
                        r.grade === "A" ? "text-emerald-600" :
                        r.grade === "F" ? "text-rose-600" : "text-slate-700 dark:text-slate-300 print:text-black"
                      }`}>
                        {r.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] ${
                        r.remark === "PASS"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30"
                      }`}>
                        {r.remark}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
                      <p className="font-semibold text-sm">No results uploaded for this semester yet.</p>
                      <p className="text-xs text-slate-500 mt-1">Please contact your department officer if this is an error.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* GPA Summary Board */}
        {filteredResults.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-4 mt-8 border-t border-slate-100 dark:border-slate-800/80 pt-6 print:border-slate-300">
            <div className="flex justify-between items-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20 print:bg-white print:border-slate-300">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Semester GPA</span>
              <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 print:text-black">{semesterGpa}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20 print:bg-white print:border-slate-300">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cumulative GPA (CGPA)</span>
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 print:text-black">{cumulativeGpa}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
