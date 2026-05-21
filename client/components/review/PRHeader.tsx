import { useState } from 'react';
import { GitBranch, GitPullRequest, User, Sparkles, ExternalLink, ThumbsUp, MessageSquareDiff, Loader2, CheckCheck, XCircle } from 'lucide-react';
import { showToast } from '@/lib/use-toast';

interface PRHeaderProps {
    title: string;
    branch: string;
    baseBranch: string;
    author: string;
    status: string;
    mergeReady: number;
    onAskAI?: () => void;
    onOpenDiff?: () => void;
    analyzing?: boolean;
}

export function PRHeader({ title, branch, baseBranch, author, status, mergeReady, onAskAI, onOpenDiff, analyzing }: PRHeaderProps) {
    const [approveState, setApproveState] = useState<'idle' | 'loading' | 'approved'>('idle');
    const [changesState, setChangesState] = useState<'idle' | 'loading' | 'requested'>('idle');

    const handleApprove = async () => {
        if (approveState === 'approved') {
            setApproveState('idle');
            showToast('Approval withdrawn', 'info');
            return;
        }
        setApproveState('loading');
        await new Promise(r => setTimeout(r, 800));
        setApproveState('approved');
        setChangesState('idle');
        showToast('Review approved!', 'success');
    };

    const handleRequestChanges = async () => {
        if (changesState === 'requested') {
            setChangesState('idle');
            showToast('Changes request withdrawn', 'info');
            return;
        }
        setChangesState('loading');
        await new Promise(r => setTimeout(r, 800));
        setChangesState('requested');
        setApproveState('idle');
        showToast('Changes requested', 'info');
    };

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 mt-0.5">
                    <GitPullRequest size={16} className="text-emerald-400" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold text-white">{title}</h1>
                    <div className="flex items-center gap-3 mt-0.5 text-sm text-neutral-500">
                        <span className="flex items-center gap-1.5">
                            <GitBranch size={14} />
                            <span className="text-neutral-400">{branch}</span>
                            <span className="text-neutral-600">&rarr;</span>
                            <span>{baseBranch}</span>
                        </span>
                        <span className="text-neutral-600">·</span>
                        <span className="flex items-center gap-1.5">
                            <User size={14} />
                            {author}
                        </span>
                        <span className="text-neutral-600">·</span>
                        <span className="flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${status === 'Open' || status === 'Reviewed' ? 'bg-emerald-400' : status === 'Analyzing' ? 'bg-accent animate-pulse' : 'bg-amber-400'}`} />
                            {status}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1.5">
                <button
                    onClick={onAskAI}
                    disabled={analyzing}
                    title="Ask AI about this PR"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-neutral-500 hover:bg-accent/10 hover:text-accent disabled:opacity-40 transition-colors"
                >
                    {analyzing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                </button>
                <button
                    onClick={onOpenDiff}
                    title="Open diff in GitHub"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-neutral-500 hover:text-neutral-200 transition-colors"
                >
                    <ExternalLink size={15} />
                </button>
                <button
                    onClick={handleApprove}
                    disabled={approveState === 'loading'}
                    title={approveState === 'approved' ? 'Withdraw approval' : 'Approve'}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                        approveState === 'approved'
                            ? 'bg-emerald-400/20 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.15)]'
                            : 'bg-white/[0.03] text-neutral-500 hover:bg-emerald-400/10 hover:text-emerald-400'
                    } disabled:opacity-60`}
                >
                    {approveState === 'loading' ? <Loader2 size={15} className="animate-spin" /> : <ThumbsUp size={15} />}
                </button>
                <button
                    onClick={handleRequestChanges}
                    disabled={changesState === 'loading'}
                    title={changesState === 'requested' ? 'Withdraw request' : 'Request changes'}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                        changesState === 'requested'
                            ? 'bg-amber-400/20 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.15)]'
                            : 'bg-white/[0.03] text-neutral-500 hover:bg-amber-400/10 hover:text-amber-400'
                    } disabled:opacity-60`}
                >
                    {changesState === 'loading' ? <Loader2 size={15} className="animate-spin" /> : <MessageSquareDiff size={15} />}
                </button>
            </div>
        </div>
    );
}
