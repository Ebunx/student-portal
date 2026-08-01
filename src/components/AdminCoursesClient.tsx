"use client";

import React, { useState } from "react";
import { Plus, Search, Edit2, Trash2, X, BookOpen, Loader2 } from "lucide-react";
import { createCourseAction, updateCourseAction, deleteCourseAction } from "@/app/actions/courses-admin";
import { useToast } from "@/components/providers";

interface Course {
  code: string;
  title: string;
  unit: number;
  status: string;
  level: number;
  semester: number;
}

interface AdminCoursesClientProps {
  courses: Course[];
}

export default function AdminCoursesClient({ courses }: AdminCoursesClientProps) {
  const { success, error, info } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [semesterFilter, setSemesterFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add / Edit Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    unit: 3,
    status: "CORE",
    level: 100,
    semester: 1,
  });

  // Filter courses
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = levelFilter === "ALL" || c.level.toString() === levelFilter;
    const matchesSemester = semesterFilter === "ALL" || c.semester.toString() === semesterFilter;

    return matchesSearch && matchesLevel && matchesSemester;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({
      code: "",
      title: "",
      unit: 3,
      status: "CORE",
      level: 100,
      semester: 1,
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setFormData({
      code: course.code,
      title: course.title,
      unit: course.unit,
      status: course.status,
      level: course.level,
      semester: course.semester,
    });
    setEditingCode(course.code);
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    info("Creating new course registration...");

    try {
      const res = await createCourseAction(formData);
      if (res.success) {
        success(res.message);
        setIsAddModalOpen(false);
        setCurrentPage(1);
      } else {
        error(res.message);
      }
    } catch (err) {
      error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCode) return;
    setIsLoading(true);
    info("Updating course specifications...");

    try {
      const res = await updateCourseAction(editingCode, formData);
      if (res.success) {
        success(res.message);
        setIsEditModalOpen(false);
      } else {
        error(res.message);
      }
    } catch (err) {
      error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (code: string, title: string) => {
    if (!confirm(`Are you sure you want to delete ${title} (${code})? This will remove the course and all student registrations/grades associated.`)) {
      return;
    }

    info("Deleting course from catalog...");
    try {
      const res = await deleteCourseAction(code);
      if (res.success) {
        success(res.message);
        if (paginatedCourses.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        error(res.message);
      }
    } catch (err) {
      error("Failed to delete course records.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top filter toolbar */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="flex flex-wrap gap-3 items-center flex-1 max-w-3xl">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by course code or title..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>

          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060912] text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Levels</option>
            <option value="100">100 Level</option>
            <option value="200">200 Level</option>
            <option value="300">300 Level</option>
            <option value="400">400 Level</option>
          </select>

          {/* Semester Filter */}
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
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" /> Add Course
        </button>
      </div>

      {/* Courses Table */}
      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-150 dark:border-slate-800">
                <th className="px-6 py-4">Course Code</th>
                <th className="px-6 py-4">Course Title</th>
                <th className="px-6 py-4 text-center">Units</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Term / Level</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedCourses.length > 0 ? (
                paginatedCourses.map((c) => (
                  <tr key={c.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                    <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">
                      {c.code}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      {c.title}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      {c.unit}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === "CORE"
                          ? "bg-indigo-50 text-indigo-750 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100"
                          : "bg-slate-50 text-slate-700 dark:bg-slate-800/40 dark:text-slate-400 border border-slate-200"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-medium text-slate-500">
                      {c.level} Level | Semester {c.semester}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer"
                          title="Edit Course"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.code, c.title)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Course"
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
                    No course records match search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>
              Showing Page {currentPage} of {totalPages} ({filteredCourses.length} entries)
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

      {/* ADD COURSE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-6 top-6 p-1.5 rounded-lg border border-border text-slate-400 hover:text-slate-650 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              Add Course to Catalog
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 mb-1.5">Course Code</label>
                <input
                  type="text"
                  name="code"
                  required
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g. MTH101"
                  className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 mb-1.5">Course Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Elementary Mathematics I"
                  className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 mb-1.5">Credit Units</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData((p) => ({ ...p, unit: Number(e.target.value) }))}
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value={1}>1 Unit</option>
                    <option value={2}>2 Units</option>
                    <option value={3}>3 Units</option>
                    <option value={4}>4 Units</option>
                    <option value={6}>6 Units</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 mb-1.5">Course Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="CORE">CORE (Compulsory)</option>
                    <option value="ELECTIVE">ELECTIVE (Optional)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 mb-1.5">Target Level</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={(e) => setFormData((p) => ({ ...p, level: Number(e.target.value) }))}
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value={100}>100 Level</option>
                    <option value={200}>200 Level</option>
                    <option value={300}>300 Level</option>
                    <option value={400}>400 Level</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 mb-1.5">Target Semester</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={(e) => setFormData((p) => ({ ...p, semester: Number(e.target.value) }))}
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value={1}>1st Semester</option>
                    <option value={2}>2nd Semester</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
                      <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                    </>
                  ) : (
                    "Create Course"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COURSE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute right-6 top-6 p-1.5 rounded-lg border border-border text-slate-400 hover:text-slate-650 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Edit2 className="h-5 w-5 text-indigo-600" />
              Edit Course: <span className="text-indigo-600 dark:text-indigo-400">{editingCode}</span>
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 mb-1.5">Course Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Elementary Mathematics I"
                  className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 mb-1.5">Credit Units</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData((p) => ({ ...p, unit: Number(e.target.value) }))}
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value={1}>1 Unit</option>
                    <option value={2}>2 Units</option>
                    <option value={3}>3 Units</option>
                    <option value={4}>4 Units</option>
                    <option value={6}>6 Units</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 mb-1.5">Course Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="CORE">CORE (Compulsory)</option>
                    <option value="ELECTIVE">ELECTIVE (Optional)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 mb-1.5">Target Level</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={(e) => setFormData((p) => ({ ...p, level: Number(e.target.value) }))}
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value={100}>100 Level</option>
                    <option value={200}>200 Level</option>
                    <option value={300}>300 Level</option>
                    <option value={400}>400 Level</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 mb-1.5">Target Semester</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={(e) => setFormData((p) => ({ ...p, semester: Number(e.target.value) }))}
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value={1}>1st Semester</option>
                    <option value={2}>2nd Semester</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Specifications"
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
