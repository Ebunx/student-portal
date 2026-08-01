"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface AdminDashboardChartsProps {
  gpaData: { name: string; count: number }[];
  levelData: { name: string; count: number }[];
}

export default function AdminDashboardCharts({ gpaData, levelData }: AdminDashboardChartsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-[300px] w-full rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
        <div className="h-[300px] w-full rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
      </div>
    );
  }

  const COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#ec4899"];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* GPA Distribution Chart */}
      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">
          GPA Distribution of Enrolled Students
        </h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gpaData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "rgba(255,255,255,0.9)",
                  border: "1px solid #cbd5e1",
                  borderRadius: "12px",
                  color: "#0f172a",
                }}
                cursor={{ fill: "rgba(99,102,241,0.05)" }}
              />
              <Bar dataKey="count" fill="url(#gpaGradient)" radius={[6, 6, 0, 0]}>
                <defs>
                  <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Registrations count per level chart */}
      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">
          Course Registrations Count by Year / Level
        </h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={levelData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "rgba(255,255,255,0.9)",
                  border: "1px solid #cbd5e1",
                  borderRadius: "12px",
                  color: "#0f172a",
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#levelGradient)"
              >
                <defs>
                  <linearGradient id="levelGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
