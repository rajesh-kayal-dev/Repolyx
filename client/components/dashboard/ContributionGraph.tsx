"use client";

import { useEffect, useState } from "react";
import { GitCommit, Flame, CalendarDays, BarChart3, Activity, AlertCircle, RefreshCw } from "lucide-react";
import { api } from "@/lib/api-client";

interface Day {
  date: string;
  count: number;
  level: number;
}

interface Week {
  days: Day[];
}

interface ContributionData {
  weeks: Week[];
  totalContributions: number;
  activeDays: number;
  longestStreak: number;
}

const LEVEL_COLORS = [
  "rgb(39, 39, 42)",
  "rgba(6, 78, 59, 0.6)",
  "rgba(4, 120, 87, 0.6)",
  "rgba(16, 185, 129, 0.5)",
  "rgba(52, 211, 153, 0.6)",
];

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ContributionGraph({ onFetchError }: { onFetchError?: () => void }) {
  const [data, setData] = useState<ContributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    api.dashboard.contributions()
      .then((res) => { if (mounted) setData(res.contributions); })
      .catch((err) => {
        if (mounted) {
          setError(err.message || "Failed to load contributions");
          if (onFetchError) onFetchError();
        }
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [onFetchError]);

  if (loading) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#0d1117] p-6">
        <div className="h-20 w-full bg-white/[0.04] rounded animate-pulse mb-5" />
        <div className="space-y-1">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex gap-[3px]">
              {[...Array(30)].map((_, j) => (
                <div key={j} className="h-[13px] w-[13px] rounded-[3px] bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#0d1117] p-6">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 shrink-0">
            <AlertCircle size={20} className="text-red-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white mb-1">Failed to load contributions</h3>
            <p className="text-xs text-neutral-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors"
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.weeks.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#0d1117] p-6">
        <p className="text-sm text-neutral-500">No contribution data yet.</p>
      </div>
    );
  }

  const monthLabels: { index: number; label: string }[] = [];
  data.weeks.forEach((week, wi) => {
    if (week.days.length > 0) {
      const d = new Date(week.days[0].date);
      const month = d.getMonth();
      if (wi === 0 || (wi > 0 && new Date(data.weeks[wi - 1].days[0]?.date || "").getMonth() !== month)) {
        monthLabels.push({ index: wi, label: MONTH_LABELS[month] });
      }
    }
  });

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0d1117] p-6">
      {/* Prominent total contribution count with GraphQL badge */}
      <div className="flex items-center gap-3 mb-5 p-4 rounded-lg bg-gradient-to-r from-emerald-500/5 to-transparent border border-emerald-500/10">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10">
          <BarChart3 size={24} className="text-emerald-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-white">{data.totalContributions.toLocaleString()}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              REAL data from GraphQL
            </span>
          </div>
          <p className="text-sm text-neutral-400 mt-0.5">contributions in the last year</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-5 text-xs">
        <span className="flex items-center gap-1.5 text-neutral-400">
          <Flame size={14} className="text-amber-400" />
          <span className="text-white font-semibold text-sm">{data.longestStreak}</span> day streak
        </span>
        <span className="text-neutral-400">
          <CalendarDays size={14} className="inline mr-1" />
          <span className="text-white font-semibold text-sm">{data.activeDays}</span> active days
        </span>
        <span className="flex items-center gap-1.5 text-neutral-400">
          <Activity size={14} className="text-accent" />
          <span className="text-white font-semibold text-sm">{data.weeks.length}</span> weeks
        </span>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex gap-[3px]">
          <div className="flex flex-col gap-[3px] text-[10px] text-neutral-500 mr-1.5">
            {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
              <div key={i} className="h-[13px] leading-[13px]">{d}</div>
            ))}
          </div>
          {data.weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px] relative">
              {monthLabels.find(m => m.index === wi) && (
                <span className="absolute -top-4 left-0 text-[10px] text-neutral-500 whitespace-nowrap">
                  {monthLabels.find(m => m.index === wi)!.label}
                </span>
              )}
              {week.days.map((day, di) => (
                <div
                  key={di}
                  className="h-[13px] w-[13px] rounded-[3px] cursor-pointer transition-colors hover:ring-1 hover:ring-white/30"
                  style={{ backgroundColor: LEVEL_COLORS[day.level] || LEVEL_COLORS[0] }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({ date: day.date, count: day.count, x: rect.left, y: rect.top - 8 });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {tooltip && (
        <div
          className="fixed z-50 px-2.5 py-1.5 rounded-md bg-neutral-900 border border-white/[0.08] text-xs text-white shadow-lg pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
        >
          <span className="font-semibold">{tooltip.count}</span> contribution{tooltip.count !== 1 ? "s" : ""} on {tooltip.date}
        </div>
      )}

      <div className="flex items-center justify-end gap-1 mt-3 text-[11px] text-neutral-500">
        <span>Less</span>
        {LEVEL_COLORS.map((c, i) => (
          <div key={i} className="h-[13px] w-[13px] rounded-[3px]" style={{ backgroundColor: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
