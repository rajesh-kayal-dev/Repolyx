'use client';

import { ActivityCard } from './ActivityCard';
import type { ActivityCardEvent } from '@/lib/types';

interface ActivityFeedProps {
  events: ActivityCardEvent[];
  isBeginner: boolean;
}

function groupEvents(events: ActivityCardEvent[]): { label: string; events: ActivityCardEvent[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const weekStart = today - now.getDay() * 86400000;

  const groups: { label: string; events: ActivityCardEvent[] }[] = [
    { label: 'Today', events: [] },
    { label: 'Yesterday', events: [] },
    { label: 'Earlier This Week', events: [] },
    { label: 'Older', events: [] },
  ];

  for (const e of events) {
    const t = new Date(e.timestamp).getTime();
    if (t >= today) groups[0].events.push(e);
    else if (t >= yesterday) groups[1].events.push(e);
    else if (t >= weekStart) groups[2].events.push(e);
    else groups[3].events.push(e);
  }

  return groups.filter((g) => g.events.length > 0);
}

export function ActivityFeed({ events, isBeginner }: ActivityFeedProps) {
  const groups = groupEvents(events);

  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-[#090b10] p-12 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-neutral-500">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="8" cy="8" r="2" fill="currentColor" />
            </svg>
          </div>
          <p className="text-sm text-neutral-400">No activity found matching your filters.</p>
          <p className="text-xs text-neutral-500">Try adjusting your search or filter criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          <div className="flex items-center gap-3 mb-3 px-1">
            <h3 className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">{group.label}</h3>
            <span className="h-px flex-1 bg-white/[0.04]" />
            <span className="text-[10px] text-neutral-600">{group.events.length}</span>
          </div>
          <div className="space-y-2">
            {group.events.map((event) => (
              <ActivityCard key={event.id} event={event} isBeginner={isBeginner} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
