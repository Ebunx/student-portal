"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, KeyRound, Mail, Loader2 } from "lucide-react";
import { authenticate } from "@/app/actions/auth";
import { useToast } from "@/components/providers";

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { success } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await authenticate("ADMIN", undefined, formData);
      if (result?.error) {
        setErrorMsg(result.error);
        setIsLoading(false);
      } else {
        success("Admin logged in successfully!");
        // The redirection is handled by NextAuth redirect throw
      }
    } catch (err: any) {
      if (err.message && err.message.includes("NEXT_REDIRECT")) {
        window.location.href = "/admin/dashboard";
        return;
      }
      setErrorMsg("An unexpected authentication error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#030712] px-6 py-12 transition-colors duration-300 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Landing Page
        </Link>

        {/* Card */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl dark:shadow-2xl transition-colors">
          <div className="flex flex-col items-center mb-8">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Portal</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">System Administration & Grading Console</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/50 text-xs font-semibold text-rose-600 dark:text-rose-400">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="email"
                  required
                  placeholder="e.g. admin@portal.com"
                  className="block w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm placeholder-slate-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#060912] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm placeholder-slate-400 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75 disabled:hover:scale-100 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Access Control"
              )}
            </button>
          </form>

          {/* Seed hint box */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Demo Credentials:{" "}
              <span className="font-semibold text-slate-600 dark:text-slate-300">admin@portal.com</span> with password{" "}
              <span className="font-semibold text-slate-600 dark:text-slate-300">AdminPass123!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
