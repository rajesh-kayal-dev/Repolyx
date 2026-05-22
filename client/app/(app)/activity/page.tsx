'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ActivityHeader } from '@/components/activity/ActivityHeader';
import { ActivityFilterPanel } from '@/components/activity/ActivityFilterPanel';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { ActivityInsights } from '@/components/activity/ActivityInsights';
import { Loader2 } from 'lucide-react';
import type { ActivityEvent, ActivityFilterItem, ActivityInsight, ActivitySuggestion } from '@/lib/types';

function getRelativeTime(dateStr: string): string {
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
  return new Date(dateStr).toLocaleDateString();
}

const FILTER_TYPE_MAP: Record<string, string | null> = {
  'All': null,
  'Scan': 'scan',
  'AI Analysis': 'analysis',
  'Alerts': 'dependency',
  'Security': 'security',
  'Docs': 'docs',
};

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [filters, setFilters] = useState<ActivityFilterItem[]>([]);
  const [insights, setInsights] = useState<ActivityInsight[]>([]);
  const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const filterEvents = events.filter((e) => {
    const typeFilter = FILTER_TYPE_MAP[activeFilter];
    if (typeFilter && e.type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.repo.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  useEffect(() => {
    async function fetchActivity() {
      try {
        const token = localStorage.getItem('repolyx_token');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${API_URL}/api/activity`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setEvents(
            data.events.map((e: any) => ({
              ...e,
              timestamp: getRelativeTime(e.timestamp),
            }))
          );
          setFilters(data.filters);
          setInsights(data.insights);
          setSuggestions(data.suggestions);
        }
      } catch (err) {
        console.error('Failed to fetch activity:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchActivity();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <ActivityHeader
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <ActivityFilterPanel activeFilter={activeFilter} filters={filters} />
        </div>
        <div className="lg:col-span-2">
          {filterEvents.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-[#090b10] p-12 text-center">
              <p className="text-neutral-400">No activity found matching your filters.</p>
            </div>
          ) : (
            <ActivityFeed events={filterEvents} />
          )}
        </div>
        <div className="lg:col-span-1">
          <ActivityInsights insights={insights} suggestions={suggestions} />
        </div>
      </div>
    </motion.div>
  );
}
