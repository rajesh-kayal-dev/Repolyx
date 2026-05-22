'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Lightbulb,
  GitCommit,
  AlertTriangle,
  Shield,
  Sparkles,
  CheckCircle2,
  Info,
} from 'lucide-react';
import type { ActivityCardEvent } from '@/lib/types';

interface ActivityCardProps {
  event: ActivityCardEvent;
  isBeginner: boolean;
}

const categoryConfig = {
  success: { border: 'border-l-emerald-500/50', badge: 'bg-emerald-500/10 text-emerald-400', icon: CheckCircle2 },
  warning: { border: 'border-l-amber-500/50', badge: 'bg-amber-500/10 text-amber-400', icon: AlertTriangle },
  critical: { border: 'border-l-red-500/50', badge: 'bg-red-500/10 text-red-400', icon: Shield },
  info: { border: 'border-l-cyan-500/50', badge: 'bg-cyan-500/10 text-cyan-400', icon: Info },
};

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function ActivityCard({ event, isBeginner }: ActivityCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = categoryConfig[event.category] || categoryConfig.info;
  const Icon = config.icon;

  const hasExpandable =
    event.expandable.aiExplanation ||
    event.expandable.suggestedFix ||
    (event.expandable.relatedFiles && event.expandable.relatedFiles.length > 0) ||
    (event.expandable.relatedReviews && event.expandable.relatedReviews.length > 0);

  return (
    <div
      className={`rounded-lg border border-white/[0.06] border-l-2 ${config.border} bg-[#090b10] hover:bg-white/[0.015] transition-colors`}
    >
      <button
        type="button"
        onClick={() => hasExpandable && setExpanded(!expanded)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left"
      >
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${config.badge}`}>
          <Icon size={13} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-white">{event.type}</span>
            <span className="text-[11px] text-neutral-500">{event.repo}</span>
            {event.live && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className={`mt-1 text-sm ${isBeginner ? 'text-neutral-300' : 'text-neutral-400 font-mono text-xs'}`}>
            {event.explanation}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[11px] text-neutral-500">{relativeTime(event.timestamp)}</span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${config.badge}`}>
              {event.category}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={event.action.href}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 rounded-md border border-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-neutral-400 hover:text-white hover:border-white/[0.12] transition-colors"
          >
            {event.action.label}
            <ExternalLink size={11} />
          </a>
          {hasExpandable && (
            <div className="text-neutral-500">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.06] px-4 py-3 space-y-3">
              {event.expandable.aiExplanation && (
                <div className="rounded-lg bg-cyan-500/5 border border-cyan-500/10 p-3">
                  <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1.5">
                    <Sparkles size={12} />
                    AI Explanation
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {isBeginner
                      ? event.expandable.aiExplanation
                      : event.expandable.aiExplanation}
                  </p>
                </div>
              )}

              {event.expandable.suggestedFix && (
                <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3">
                  <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1.5">
                    <Lightbulb size={12} />
                    Suggested Action
                  </div>
                  <p className="text-xs text-neutral-400">{event.expandable.suggestedFix}</p>
                </div>
              )}

              {event.expandable.relatedFiles && event.expandable.relatedFiles.length > 0 && (
                <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3">
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1.5">
                    <FileText size={12} />
                    Affected Files
                  </div>
                  <div className="space-y-1">
                    {event.expandable.relatedFiles.slice(0, 4).map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="text-neutral-500 font-mono truncate">{f.path}</span>
                        <span className="text-neutral-600 shrink-0">— {f.purpose}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {event.expandable.relatedReviews && event.expandable.relatedReviews.length > 0 && (
                <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3">
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1.5">
                    <GitCommit size={12} />
                    Related Reviews
                  </div>
                  <div className="space-y-1">
                    {event.expandable.relatedReviews.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="text-neutral-300">{r.title}</span>
                        <span className={`text-[10px] px-1 py-0.5 rounded ${
                          r.risk === 'high' ? 'bg-red-500/10 text-red-400' :
                          r.risk === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-emerald-500/10 text-emerald-400'
                        }`}>{r.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isBeginner && (
                <div className="rounded-lg bg-white/[0.02] p-3">
                  <p className="text-[11px] text-neutral-500">
                    This event indicates that an automated process has completed in your workspace. 
                    Click &quot;View Details&quot; to explore the repository and see what was found.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
