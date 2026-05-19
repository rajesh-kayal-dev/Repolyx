import { ActivityHeader, ActivityFilters } from '@/components/activity/ActivityHeader';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { ActivitySidebar } from '@/components/activity/ActivitySidebar';
import { activityEvents } from '@/lib/mock-data';

export default function ActivityPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <ActivityHeader />

            {/* Filters */}
            <ActivityFilters />

            {/* 2-column layout */}
            <div className="grid gap-8 xl:grid-cols-[1fr_280px]">
                {/* Primary: timeline */}
                <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                    <ActivityFeed events={activityEvents} />
                </div>

                {/* Secondary: sidebar */}
                <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                    <ActivitySidebar />
                </div>
            </div>
        </div>
    );
}
