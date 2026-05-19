import { DebugHeader } from '@/components/debug/DebugHeader';
import { ActiveIncidents } from '@/components/debug/ActiveIncidents';
import { InvestigationTimeline } from '@/components/debug/InvestigationTimeline';
import { LogViewer } from '@/components/debug/LogViewer';
import { AIDebugPanel } from '@/components/debug/AIDebugPanel';
import { RuntimeHealth } from '@/components/debug/RuntimeHealth';

export default function DebugPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <DebugHeader />

            {/* 2-column layout */}
            <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
                {/* Left: debugging workflow */}
                <div className="space-y-8">
                    <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                        <ActiveIncidents />
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                        <InvestigationTimeline />
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                        <LogViewer />
                    </div>
                </div>

                {/* Right: AI insights + health */}
                <div className="space-y-8">
                    <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                        <AIDebugPanel />
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                        <RuntimeHealth />
                    </div>
                </div>
            </div>
        </div>
    );
}
