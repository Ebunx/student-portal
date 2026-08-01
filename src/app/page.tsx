"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  BookOpen,
  FileSpreadsheet,
  CreditCard,
  Bell,
  ArrowRight,
  Sparkles,
  Users,
  Award,
  CheckCircle,
  HelpCircle,
  ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    {
      icon: BookOpen,
      title: "Course Registration",
      desc: "Register for semester courses instantly with real-time unit calculation and conflict checking."
    },
    {
      icon: FileSpreadsheet,
      title: "Result Checker",
      desc: "Access your grades, view detailed semester transcripts, and track CGPA progression with print support."
    },
    {
      icon: CreditCard,
      title: "Online Payments",
      desc: "Track fees histories, Acceptance fees, and Medical clearances securely and check invoice status."
    },
    {
      icon: Bell,
      title: "Announcements Board",
      desc: "Get real-time updates and push notifications on deadlines and administrative decisions directly."
    },
    {
      icon: ShieldCheck,
      title: "Admin Control Panel",
      desc: "Administrators can manage students, allocate course catalogs, upload transcripts, and track metrics."
    },
    {
      icon: Users,
      title: "Student Management",
      desc: "Easily enroll new students, edit profiles, process level promotions, and search using matric numbers."
    }
  ];

  const testimonials = [
    {
      quote: "The Apex Portal has made semester registrations stress-free. I can check my grades and download my transcripts in seconds.",
      name: "Ebun Coker",
      role: "Year 3 Computer Science Student"
    },
    {
      quote: "As an administrator, managing registrations and grading has never been this seamless. The analytics charts give us instant insights.",
      name: "Dr. Olatunji",
      role: "Dean of Computing & Technology"
    },
    {
      quote: "No more long queues for fees validation! Everything is tracked in the payment portal, and my medical clearance was approved instantly.",
      name: "Fatima Yusuf",
      role: "Software Engineering Student"
    }
  ];

  const faqs = [
    {
      q: "How do I log in to the student portal?",
      a: "Use your allocated Matric Number (e.g., STA/2023/001) and your password to sign in via the Student Login page."
    },
    {
      q: "What is the maximum course unit limit per semester?",
      a: "Standard regulations set the limit to 24 units per semester. The registration panel calculates total units dynamically and prevents submission if you exceed this limit."
    },
    {
      q: "Can I print my registered courses and results?",
      a: "Yes! Both the Course Registration slip and Results slip feature 'Print' options that format your data into clean, official documents."
    },
    {
      q: "How does the admin assign courses to levels?",
      a: "Admins can use the Course Management interface to allocate courses to specific departments, levels, and semesters."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Landing Navbar */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-[#030712]/75 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
              APEX UNIVERSITY
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login/student"
              className="text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Student Login
            </Link>
            <Link
              href="/login/admin"
              className="hidden sm:inline-flex text-sm font-medium border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/30 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="h-3.5 w-3.5" /> Next-Generation Education Management
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Empowering Students,{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                Simplifying Administration.
              </span>
            </h1>
            
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
              Access your classes, check grades, settle university fees, and register for courses in a fully responsive, secure, and intuitive student ecosystem.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/login/student"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Access Student Portal
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/login/admin"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-[#0b0f19] dark:hover:bg-[#111827] font-medium transition-all"
              >
                Administrative Entrance
              </Link>
            </div>
          </div>

          {/* Interactive Mockup Grid */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] shadow-2xl p-6 overflow-hidden">
              {/* Header mockup */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="text-xs bg-slate-100 dark:bg-slate-800/50 px-4 py-1 rounded-lg text-slate-500">
                  student-portal.apex.edu
                </div>
              </div>

              {/* Layout Mock */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">Welcome back, Ebun!</h4>
                    <p className="text-[10px] text-slate-400">Software Engineering | 300 Level</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-indigo-500/10 border border-indigo-500/20" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
                    <p className="text-[10px] text-slate-400">Cumulative GPA</p>
                    <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">4.82 / 5.00</p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
                    <p className="text-[10px] text-slate-400">Registered Courses</p>
                    <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">7 Courses (22 Units)</p>
                  </div>
                </div>

                {/* Course list mock */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-400">Active Registrations</p>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="font-semibold">SEN301</span>
                      <span className="text-slate-400 truncate max-w-[120px]">Software Architecture</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">CORE</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="font-semibold">CSC305</span>
                      <span className="text-slate-400 truncate max-w-[120px]">Operating Systems</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">CORE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28 bg-white dark:bg-[#0b0f19] border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Comprehensive Features For Academic Success
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              An all-in-one university portal custom-tailored to provide seamless logistics and reports to both students and administrators.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-[#030712]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Trusted by Students & Faculty
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Hear from members of the university community who use Apex Portal daily.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-slate-600 dark:text-slate-300 italic text-sm leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{t.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-28 bg-white dark:bg-[#0b0f19] transition-colors border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Quick answers to the most common questions about the Student Portal.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm md:text-base hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                        isOpen ? "transform rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-[#050912] border-t border-slate-200 dark:border-slate-800 transition-colors py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-base bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
              APEX UNIVERSITY
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Apex University Student Portal. All rights reserved. Made for portfolio-demonstration.
          </p>

          <div className="flex gap-4">
            <Link href="/login/student" className="text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400">
              Student login
            </Link>
            <Link href="/login/admin" className="text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400">
              Admin login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
