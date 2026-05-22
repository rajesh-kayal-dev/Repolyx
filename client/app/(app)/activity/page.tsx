'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ActivityHeader } from '@/components/activity/ActivityHeader';
import { ActivityQuickFilters } from '@/components/activity/ActivityQuickFilters';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { ActivityInsights } from '@/components/activity/ActivityInsights';
import { Loader2, RefreshCw } from 'lucide-react';
import type { ActivityCardEvent, WorkspaceInsights, LiveScan, RepoOption } from '@/lib/types';

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityCardEvent[]>([]);
  const [repositories, setRepositories] = useState<RepoOption[]>([]);
  const [insights, setInsights] = useState<WorkspaceInsights | null>(null);
  const [liveScans, setLiveScans] = useState<LiveScan[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepo, setSelectedRepo] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [isBeginner, setIsBeginner] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivity = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      const token = localStorage.getItem('repolyx_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const params = new URLSearchParams();
      if (activeFilter !== 'all') params.set('type', activeFilter);
      if (selectedRepo !== 'all') params.set('repo', selectedRepo);
      if (timeFilter !== 'all') params.set('time', timeFilter);
      if (searchQuery) params.set('search', searchQuery);
      params.set('limit', '50');

      const res = await fetch(`${API_URL}/api/activity?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setEvents(data.events);
        setRepositories(data.repositories || []);
        setInsights(data.insights);
        setLiveScans(data.liveScans || []);
      }
    } catch (err) {
      console.error('Failed to fetch activity:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter, selectedRepo, timeFilter, searchQuery]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const handleRefresh = () => fetchActivity(true);

  const handleModeToggle = () => setIsBeginner((v) => !v);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          <p className="text-sm text-neutral-500">Loading workspace activity...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <ActivityHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRepo={selectedRepo}
        onRepoChange={setSelectedRepo}
        timeFilter={timeFilter}
        onTimeChange={setTimeFilter}
        isBeginner={isBeginner}
        onModeToggle={handleModeToggle}
        repositories={repositories}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <ActivityQuickFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-1 px-1">
            <p className="text-xs text-neutral-500">
              {events.length} event{events.length !== 1 ? 's' : ''}
              {activeFilter !== 'all' ? ` · filtered by ${activeFilter}` : ''}
            </p>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.03] transition-colors disabled:opacity-50"
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
          <ActivityFeed events={events} isBeginner={isBeginner} />
        </div>

        <div className="lg:col-span-1">
          <ActivityInsights insights={insights} liveScans={liveScans} isBeginner={isBeginner} />
        </div>
      </div>
    </motion.div>
  );
}
