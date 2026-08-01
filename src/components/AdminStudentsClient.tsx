"use client";

import React, { useState } from "react";
import { Plus, Search, Edit2, Trash2, X, GraduationCap, Mail, Phone, Loader2 } from "lucide-react";
import { createStudentAction, updateStudentAction, deleteStudentAction } from "@/app/actions/students";
import { useToast } from "@/components/providers";

interface Student {
  matricNumber: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  faculty: string;
  level: number;
  session: string;
}

interface AdminStudentsClientProps {
  students: Student[];
}

export default function AdminStudentsClient({ students }: AdminStudentsClientProps) {
  const { success, error, info } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add / Edit Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMatric, setEditingMatric] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    matricNumber: "",
    name: "",
    email: "",
    phone: "",
    department: "Computer Science",
    faculty: "Science",
    level: 100,
    session: "2026/2027",
    password: "",
  });

  // Extract Departments for filters
  const departments = Array.from(new Set(students.map((s) => s.department)));

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.matricNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = levelFilter === "ALL" || s.level.toString() === levelFilter;
    const matchesDept = deptFilter === "ALL" || s.department === deptFilter;

    return matchesSearch && matchesLevel && matchesDept;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({
      matricNumber: "",
      name: "",
      email: "",
      phone: "",
      department: "Computer Science",
      faculty: "Science",
      level: 100,
      session: "2026/2027",
      password: "StudentPass123!",
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setFormData({
      matricNumber: student.matricNumber,
      name: student.name,
      email: student.email,
      phone: student.phone,
      department: student.department,
      faculty: student.faculty,
      level: student.level,
      session: student.session,
      password: "", // leave empty unless changing
    });
    setEditingMatric(student.matricNumber);
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    info("Enrolling new student...");

    try {
      const res = await createStudentAction(formData);
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
    if (!editingMatric) return;
    setIsLoading(true);
    info("Updating student details...");

    try {
      const res = await updateStudentAction(editingMatric, formData);
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

  const handleDelete = async (matric: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name} (${matric})? This action will permanently remove all associated registrations and grades.`)) {
      return;
    }

    info("Deleting student records...");
    try {
      const res = await deleteStudentAction(matric);
      if (res.success) {
        success(res.message);
        if (paginatedStudents.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        error(res.message);
      }
    } catch (err) {
      error("Failed to delete student records.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="flex flex-wrap gap-3 items-center flex-1 max-w-3xl">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or matric number..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060912] text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

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
            <option value="100">100 Lvl</option>
            <option value="200">200 Lvl</option>
            <option value="300">300 Lvl</option>
            <option value="400">400 Lvl</option>
          </select>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" /> Enroll Student
        </button>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-150 dark:border-slate-800">
                <th className="px-6 py-4">Matric Number</th>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4 text-center">Level</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((s) => (
                  <tr key={s.matricNumber} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                    <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">
                      {s.matricNumber}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <div>
                        <p className="text-slate-800 dark:text-slate-200">{s.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{s.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{s.department}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {s.level}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer"
                          title="Edit Student"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.matricNumber, s.name)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Student"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No student records match search criteria.
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
              Showing Page {currentPage} of {totalPages} ({filteredStudents.length} entries)
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

      {/* ADD STUDENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-6 top-6 p-1.5 rounded-lg border border-border text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
              <GraduationCap className="h-6 w-6 text-indigo-600" />
              Enroll New Student
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">Matric Number</label>
                  <input
                    type="text"
                    name="matricNumber"
                    required
                    value={formData.matricNumber}
                    onChange={handleInputChange}
                    placeholder="STA/2023/021"
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. John Doe"
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@portal.com"
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+2348030000000"
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">Faculty</label>
                  <select
                    name="faculty"
                    value={formData.faculty}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="Science">Science</option>
                    <option value="Computing & Technology">Computing & Technology</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">Academic Level</label>
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">Current Session</label>
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
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
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
                      <Loader2 className="h-4 w-4 animate-spin" /> Enrolling...
                    </>
                  ) : (
                    "Confirm Enrollment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute right-6 top-6 p-1.5 rounded-lg border border-border text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Edit2 className="h-5 w-5 text-indigo-600" />
              Edit Student Profile: <span className="text-indigo-600 dark:text-indigo-400">{editingMatric}</span>
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@portal.com"
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+2348030000000"
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">Faculty</label>
                  <select
                    name="faculty"
                    value={formData.faculty}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="Science">Science</option>
                    <option value="Computing & Technology">Computing & Technology</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">Academic Level</label>
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">Current Session</label>
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
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">
                  New Password <span className="text-[10px] text-slate-400 lowercase italic">(leave empty to keep current)</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
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
                      <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                    </>
                  ) : (
                    "Save Changes"
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
