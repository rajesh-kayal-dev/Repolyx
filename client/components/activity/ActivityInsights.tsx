'use client';

import { motion } from 'framer-motion';
import { Database, Heart, AlertTriangle, Shield, ArrowRight, Sparkles, RotateCw } from 'lucide-react';
import type { WorkspaceInsights, LiveScan } from '@/lib/types';

interface ActivityInsightsProps {
  insights: WorkspaceInsights | null;
  liveScans: LiveScan[];
  isBeginner: boolean;
}

export function ActivityInsights({ insights, liveScans, isBeginner }: ActivityInsightsProps) {
  if (!insights) return null;

  const healthColor =
    insights.healthScore >= 80 ? 'text-emerald-400' :
    insights.healthScore >= 50 ? 'text-amber-400' :
    'text-red-400';

  const healthBg =
    insights.healthScore >= 80 ? 'bg-emerald-500/10' :
    insights.healthScore >= 50 ? 'bg-amber-500/10' :
    'bg-red-500/10';

  return (
    <motion.aside initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/[0.06] bg-[#090b10] p-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">AI Workspace Insights</h2>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3">
              <div className="flex items-center gap-2">
                <Database size={13} className="text-cyan-400" />
                <span className="text-xs text-neutral-400">Repositories Scanned</span>
              </div>
              <p className="text-2xl font-semibold text-white mt-1">{insights.repositoriesScanned}</p>
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3">
              <div className="flex items-center gap-2">
                <Heart size={13} className={healthColor} />
                <span className="text-xs text-neutral-400">AI Health Score</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className={`text-2xl font-semibold ${healthColor}`}>{insights.healthScore}%</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${healthBg} ${healthColor}`}>
                  {insights.healthScore >= 80 ? 'Good' : insights.healthScore >= 50 ? 'Fair' : 'Poor'}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={13} className={insights.activeIssues > 0 ? 'text-amber-400' : 'text-emerald-400'} />
                <span className="text-xs text-neutral-400">Active Issues</span>
              </div>
              <p className={`text-2xl font-semibold mt-1 ${insights.activeIssues > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {insights.activeIssues}
              </p>
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3">
              <div className="flex items-center gap-2">
                <Shield size={13} className={insights.securityRisks > 0 ? 'text-red-400' : 'text-emerald-400'} />
                <span className="text-xs text-neutral-400">Security Risks</span>
              </div>
              <p className={`text-2xl font-semibold mt-1 ${insights.securityRisks > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {insights.securityRisks}
              </p>
            </div>
          </div>
        </div>

        {insights.recommendedActions.length > 0 && (
          <div className="rounded-2xl border border-white/[0.06] bg-[#090b10] p-4">
            <h3 className="text-[11px] uppercase tracking-[0.15em] text-neutral-500 mb-3">Recommended Next Actions</h3>
            <div className="space-y-2">
              {insights.recommendedActions.map((action, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl bg-white/[0.02] border border-white/[0.06] p-3"
                >
                  <ArrowRight size={12} className="shrink-0 mt-0.5 text-cyan-400" />
                  <div>
                    <p className="text-xs text-neutral-300">
                      {isBeginner
                        ? action.text
                        : action.text}
                    </p>
                    <span className={`text-[10px] ${
                      action.priority === 'high' ? 'text-red-400' :
                      action.priority === 'medium' ? 'text-amber-400' :
                      'text-neutral-500'
                    }`}>
                      {action.priority} priority
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {liveScans.length > 0 && (
          <div className="rounded-2xl border border-white/[0.06] bg-[#090b10] p-4">
            <div className="flex items-center gap-2 mb-3">
              <RotateCw size={13} className="text-emerald-400 animate-spin" />
              <h3 className="text-xs font-semibold text-white">Live Activity</h3>
            </div>
            <div className="space-y-3">
              {liveScans.map((scan, i) => (
                <div key={i} className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3">
                  <p className="text-xs font-medium text-white mb-2">{scan.repo}</p>
                  <div className="space-y-1.5">
                    {scan.steps.map((step, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                          step.done ? 'bg-emerald-400' : 'bg-neutral-600 animate-pulse'
                        }`} />
                        <span className={`text-[11px] ${step.done ? 'text-neutral-500' : 'text-neutral-400'}`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
