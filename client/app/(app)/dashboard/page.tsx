import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { ActiveSessions } from '@/components/dashboard/ActiveSessions';
import { RepoHealth } from '@/components/dashboard/RepoHealth';
import { SuggestedActions } from '@/components/dashboard/SuggestedActions';
import { WorkspaceOverview } from '@/components/dashboard/WorkspaceOverview';

export default function DashboardPage() {
    return (
        <div className="space-y-10">
            {/* Page header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-white">Workspace Overview</h1>
                    <p className="text-sm text-neutral-500 mt-0.5">repolyx/cli &middot; main branch</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-1.5 text-sm font-medium text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200 transition-colors"
                    >
                        Documentation
                    </button>
                    <button
                        type="button"
                        className="rounded-lg bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
                    >
                        New analysis
                    </button>
                </div>
            </div>

            {/* Workspace Overview */}
            <WorkspaceOverview />

            {/* Main grid */}
            <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
                {/* Left column */}
                <div className="space-y-10">
                    <ActiveSessions />
                    <RepoHealth />
                </div>

                {/* Right column */}
                <div className="space-y-10">
                    <SuggestedActions />
                    <ActivityFeed />
                </div>
            </div>
        </div>
    );
}
