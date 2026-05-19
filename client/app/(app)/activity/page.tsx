import { ActivityHeader } from '@/components/activity/ActivityHeader';

export default function ActivityPage() {
    return (
        <div className="space-y-8">
            <ActivityHeader />

            <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                <div className="text-center py-12">
                    <h2 className="text-sm font-semibold text-white mb-1">Activity Timeline</h2>
                    <p className="text-xs text-neutral-500">
                        Import and index repositories to see their activity here.
                    </p>
                </div>
            </div>
        </div>
    );
}
