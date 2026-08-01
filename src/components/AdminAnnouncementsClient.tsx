"use client";

import React, { useState } from "react";
import { Plus, Search, Trash2, X, Megaphone, Loader2 } from "lucide-react";
import { createAnnouncementAction, deleteAnnouncementAction } from "@/app/actions/announcements";
import { useToast } from "@/components/providers";

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

interface AdminAnnouncementsClientProps {
  announcements: Announcement[];
}

export default function AdminAnnouncementsClient({ announcements }: AdminAnnouncementsClientProps) {
  const { success, error, info } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  // Filter announcements
  const filteredAnnouncements = announcements.filter((ann) => {
    return (
      ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);
  const paginatedAnnouncements = filteredAnnouncements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({ title: "", content: "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    info("Publishing announcement to bulletin board...");

    try {
      const res = await createAnnouncementAction(formData.title, formData.content);
      if (res.success) {
        success(res.message);
        setIsModalOpen(false);
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

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the announcement: "${title}"?`)) {
      return;
    }

    info("Deleting announcement...");
    try {
      const res = await deleteAnnouncementAction(id);
      if (res.success) {
        success(res.message);
        if (paginatedAnnouncements.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        error(res.message);
      }
    } catch (err) {
      error("Failed to delete announcement.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action toolbar */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="relative flex-1 max-w-md min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search announcements by title or content..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" /> Post Announcement
        </button>
      </div>

      {/* Announcements Grid */}
      <div className="space-y-4">
        {paginatedAnnouncements.length > 0 ? (
          paginatedAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-850 dark:text-slate-200 flex items-center gap-2">
                    <Megaphone className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    {ann.title}
                  </h3>
                  <span className="text-xs text-slate-400 font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-2.5 py-0.5 rounded-full">
                    {new Date(ann.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed whitespace-pre-line">
                  {ann.content}
                </p>
              </div>

              <button
                onClick={() => handleDelete(ann.id, ann.title)}
                className="self-end sm:self-start p-2 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-450 transition-colors cursor-pointer shrink-0"
                title="Delete Announcement"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </button>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 font-semibold">
            No announcement bulletins found matching filters.
          </div>
        )}
      </div>

      {/* Pagination Toolbar */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl px-6 py-4 flex items-center justify-between text-xs text-slate-500 font-semibold shadow-sm">
          <span>
            Showing Page {currentPage} of {totalPages} ({filteredAnnouncements.length} entries)
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

      {/* ADD ANNOUNCEMENT MODAL */}
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
              <Megaphone className="h-6 w-6 text-indigo-600" />
              Post Announcement Bulletin
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 mb-1.5">Announcement Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Supplementary Exams Schedule"
                  className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 mb-1.5">Announcement Content</label>
                <textarea
                  name="content"
                  required
                  rows={6}
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Write the full announcement announcement here..."
                  className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                />
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
                      <Loader2 className="h-4 w-4 animate-spin" /> Publishing...
                    </>
                  ) : (
                    "Publish Bulletin"
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
