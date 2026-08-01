"use client";

import React, { useState } from "react";
import { Plus, Search, Edit2, Trash2, X, Award, Loader2 } from "lucide-react";
import { uploadResultAction, deleteResultAction } from "@/app/actions/results-admin";
import { useToast } from "@/components/providers";

interface Course {
  code: string;
  title: string;
}

interface Student {
  matricNumber: string;
  name: string;
}

interface Result {
  id: string;
  studentMatric: string;
  courseCode: string;
  score: number;
  grade: string;
  remark: string;
  semester: number;
  session: string;
  student: Student;
  course: Course;
}

interface AdminResultsClientProps {
  results: Result[];
  students: Student[];
  courses: Course[];
}

export default function AdminResultsClient({ results, students, courses }: AdminResultsClientProps) {
  const { success, error, info } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [sessionFilter, setSessionFilter] = useState("ALL");
  const [semesterFilter, setSemesterFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Upload/Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    studentMatric: "",
    courseCode: "",
    score: 0,
    semester: 1,
    session: "2026/2027",
  });

  // Extract sessions represented
  const sessions = Array.from(new Set(results.map((r) => r.session))).sort().reverse();

  // Filter results
  const filteredResults = results.filter((r) => {
    const matchesSearch =
      r.studentMatric.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.courseCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSession = sessionFilter === "ALL" || r.session === sessionFilter;
    const matchesSemester = semesterFilter === "ALL" || r.semester.toString() === semesterFilter;

    return matchesSearch && matchesSession && matchesSemester;
  });

  // Pagination
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openUploadModal = () => {
    setIsEditing(false);
    setFormData({
      studentMatric: students[0]?.matricNumber || "",
      courseCode: courses[0]?.code || "",
      score: 75,
      semester: 1,
      session: "2026/2027",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (res: Result) => {
    setIsEditing(true);
    setFormData({
      studentMatric: res.studentMatric,
      courseCode: res.courseCode,
      score: res.score,
      semester: res.semester,
      session: res.session,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    info(isEditing ? "Updating grade sheet..." : "Uploading student grade...");

    try {
      const res = await uploadResultAction(formData);
      if (res.success) {
        success(res.message);
        setIsModalOpen(false);
      } else {
        error(res.message);
      }
    } catch (err) {
      error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, studentName: string, courseCode: string) => {
    if (!confirm(`Are you sure you want to delete the result of ${studentName} for ${courseCode}?`)) {
      return;
    }

    info("Deleting result sheet...");
    try {
      const res = await deleteResultAction(id);
      if (res.success) {
        success(res.message);
        if (paginatedResults.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        error(res.message);
      }
    } catch (err) {
      error("Failed to delete result.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Action panel */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="flex flex-wrap gap-3 items-center flex-1 max-w-3xl">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, matric, or course..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>

          {/* Session filter */}
          <select
            value={sessionFilter}
            onChange={(e) => {
              setSessionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060912] text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Sessions</option>
            {sessions.map((sess) => (
              <option key={sess} value={sess}>
                {sess}
              </option>
            ))}
          </select>

          {/* Semester filter */}
          <select
            value={semesterFilter}
            onChange={(e) => {
              setSemesterFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060912] text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Semesters</option>
            <option value="1">1st Semester</option>
            <option value="2">2nd Semester</option>
          </select>
        </div>

        <button
          onClick={openUploadModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" /> Upload Score
        </button>
      </div>

      {/* Results List Card */}
      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-150 dark:border-slate-800">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4 text-center">Score</th>
                <th className="px-6 py-4 text-center">Grade</th>
                <th className="px-6 py-4 text-center">Term / Semester</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedResults.length > 0 ? (
                paginatedResults.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-850 dark:text-slate-250">{r.student.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{r.studentMatric}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-indigo-600 dark:text-indigo-400">{r.courseCode}</p>
                        <p className="text-xs text-slate-500 max-w-[200px] truncate">{r.course.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-805 dark:text-slate-205">
                      {r.score}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-black ${
                        r.grade === "A" ? "text-emerald-600" :
                        r.grade === "F" ? "text-rose-600" : "text-slate-700 dark:text-slate-300"
                      }`}>
                        {r.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-medium text-slate-500">
                      {r.session} | Semester {r.semester}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer"
                          title="Edit Score"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id, r.student.name, r.courseCode)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Score"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No result sheets match search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>
              Showing Page {currentPage} of {totalPages} ({filteredResults.length} entries)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* UPLOAD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-6 top-6 p-1.5 rounded-lg border border-border text-slate-400 hover:text-slate-650 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Award className="h-6 w-6 text-indigo-600" />
              {isEditing ? "Modify Grade Sheet" : "Upload Student Grade"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Student selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 mb-1.5">Select Student</label>
                {isEditing ? (
                  <input
                    type="text"
                    disabled
                    value={formData.studentMatric}
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 text-sm"
                  />
                ) : (
                  <select
                    name="studentMatric"
                    value={formData.studentMatric}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm cursor-pointer"
                  >
                    {students.map((s) => (
                      <option key={s.matricNumber} value={s.matricNumber}>
                        {s.name} ({s.matricNumber})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 mb-1.5">Select Course</label>
                {isEditing ? (
                  <input
                    type="text"
                    disabled
                    value={formData.courseCode}
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 text-sm"
                  />
                ) : (
                  <select
                    name="courseCode"
                    value={formData.courseCode}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm cursor-pointer"
                  >
                    {courses.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Score field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 mb-1.5">Exam Score (0 - 100)</label>
                <input
                  type="number"
                  name="score"
                  required
                  min={0}
                  max={100}
                  value={formData.score}
                  onChange={(e) => setFormData((p) => ({ ...p, score: Number(e.target.value) }))}
                  placeholder="e.g. 75"
                  className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              {/* Session / Semester Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 mb-1.5">Session Term</label>
                  {isEditing ? (
                    <input
                      type="text"
                      disabled
                      value={formData.session}
                      className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 text-sm"
                    />
                  ) : (
                    <select
                      name="session"
                      value={formData.session}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    >
                      <option value="2023/2024">2023/2024</option>
                      <option value="2024/2025">2024/2025</option>
                      <option value="2025/2026">2025/2026</option>
                      <option value="2026/2027">2026/2027</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 mb-1.5">Semester</label>
                  {isEditing ? (
                    <input
                      type="text"
                      disabled
                      value={formData.semester === 1 ? "1st Sem" : "2nd Sem"}
                      className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 text-sm"
                    />
                  ) : (
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={(e) => setFormData((p) => ({ ...p, semester: Number(e.target.value) }))}
                      className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    >
                      <option value={1}>1st Semester</option>
                      <option value={2}>2nd Semester</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 shadow-sm disabled:opacity-75"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    "Record Grade"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
