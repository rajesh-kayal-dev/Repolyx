import { RepoHeader } from '@/components/repository/RepoHeader';
import { RepoExplorer } from '@/components/repository/RepoExplorer';
import { RepoSummary } from '@/components/repository/RepoSummary';
import { AIWorkspacePanel } from '@/components/repository/AIWorkspacePanel';
import { RepoActivity } from '@/components/repository/RepoActivity';
import { repoWorkspace, repoTree, aiAssistantEvents } from '@/lib/mock-data';

export default function RepositoryWorkspacePage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <RepoHeader
                name={repoWorkspace.name}
                branch={repoWorkspace.branch}
                status={repoWorkspace.status}
            />

            {/* 2-column layout */}
            <div className="grid gap-8 xl:grid-cols-[1fr_1.2fr]">
                {/* Left: explorer + summary */}
                <div className="space-y-8">
                    <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                        <RepoExplorer tree={repoTree} />
                    </div>
                    <RepoSummary
                        stack={repoWorkspace.stack}
                        status={repoWorkspace.status}
                        files={repoWorkspace.metrics.files}
                        dependencies={repoWorkspace.metrics.dependencies}
                        apis={repoWorkspace.metrics.apis}
                        lastSync="2 min ago"
                        size="24 MB"
                    />
                </div>

                {/* Right: AI workspace + activity */}
                <div className="space-y-8">
                    <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                        <AIWorkspacePanel events={aiAssistantEvents} />
                    </div>
                    <RepoActivity />
                </div>
            </div>
        </div>
    );
}
