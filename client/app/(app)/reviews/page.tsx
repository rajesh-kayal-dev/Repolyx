'use client';

import { useState, useEffect, useCallback } from 'react';
import { GitPullRequest, Plus, Trash2, RefreshCw, FileText, ExternalLink, Clock, AlertTriangle, CheckCircle2, Shield, Lightbulb, Sparkles, Loader2, GitBranch, User, Tag, BookOpen, ArrowRight, Github } from 'lucide-react';
import { api } from '@/lib/api-client';
import { showToast } from '@/lib/use-toast';
import { PRHeader } from '@/components/review/PRHeader';
import { AISuggestions } from '@/components/review/AISuggestions';
import { PRSummaryHero } from '@/components/review/PRSummaryHero';
import { InsightCards } from '@/components/review/InsightCards';
import { CategorizedFileList } from '@/components/review/CategorizedFileList';
import { ReviewTimeline } from '@/components/review/ReviewTimeline';
import { AIReport } from '@/components/review/AIReport';

type PageMode = 'list' | 'create' | 'detail';

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function ReviewsPage() {
  const [mode, setMode] = useState<PageMode>('list');
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeReview, setActiveReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const [prUrl, setPrUrl] = useState('');
  const [diffContent, setDiffContent] = useState('');
  const [selectedRepoId, setSelectedRepoId] = useState('');
  const [repositories, setRepositories] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);

  const [recentPrs, setRecentPrs] = useState<any[]>([]);
  const [prsLoading, setPrsLoading] = useState(false);
  const [prsError, setPrsError] = useState('');
  const [inputMode, setInputMode] = useState<'pr-picker' | 'pr-url' | 'diff-paste'>('pr-picker');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [aiResponding, setAiResponding] = useState(false);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.reviews.list();
      setReviews(res.sessions || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRepositories = useCallback(async () => {
    try {
      const res = await api.repositories.list();
      setRepositories(res.repositories || []);
      if (res.repositories?.length > 0 && !selectedRepoId) {
        setSelectedRepoId(res.repositories[0].id);
      }
    } catch { }
  }, [selectedRepoId]);

  const loadRecentPrs = useCallback(async (repoId: string) => {
    if (!repoId) return;
    try {
      setPrsLoading(true);
      setPrsError('');
      const res = await api.reviews.listPrs(repoId);
      setRecentPrs(res.prs || []);
    } catch (err: any) {
      setPrsError(err.message || 'Failed to fetch PRs');
      setRecentPrs([]);
    } finally {
      setPrsLoading(false);
    }
  }, []);

  useEffect(() => { loadReviews(); loadRepositories(); }, [loadReviews, loadRepositories]);

  useEffect(() => {
    if (selectedRepoId && mode === 'create') {
      loadRecentPrs(selectedRepoId);
    }
  }, [selectedRepoId, mode, loadRecentPrs]);

  useEffect(() => {
    if (!activeReview || activeReview.status !== 'analyzing') return;
    let timer: any;
    let active = true;

    const pollStatus = async () => {
      try {
        const res = await api.reviews.get(activeReview.id);
        if (!active) return;
        if (res.session.status !== 'analyzing') {
          setActiveReview(res.session);
          loadReviews();
        } else {
          timer = setTimeout(pollStatus, 3000);
        }
      } catch (err) {
        if (!active) return;
        timer = setTimeout(pollStatus, 3000);
      }
    };
    timer = setTimeout(pollStatus, 3000);
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [activeReview?.id, activeReview?.status, loadReviews]);

  const handleQuickCreate = async (pr: any) => {
    if (!selectedRepoId) return;
    try {
      setCreating(true);
      setError('');
      const res = await api.reviews.create({
        repositoryId: selectedRepoId,
        prUrl: pr.url,
      });
      showToast('Review created successfully', 'success');
      setActiveReview(res.session);
      setMode('detail');
      setPrUrl('');
      setDiffContent('');
      loadReviews();
    } catch (err: any) {
      showToast(err.message || 'Failed to create review', 'error');
      setError(err.message || 'Failed to create review');
    } finally {
      setCreating(false);
    }
  };

  const handleAskAI = async () => {
    if (!activeReview) return;
    if (aiResponding) return;
    const needsAnalysis = activeReview.status !== 'completed';
    if (needsAnalysis) {
      setAiResponding(true);
      setAnalyzing(true);
      setError('');
      showToast('Analyzing PR for AI review...', 'info');
      try {
        const res = await api.reviews.analyze(activeReview.id);
        setActiveReview(res.session);
        loadReviews();
      } catch (err: any) {
        showToast(err.message || 'Analysis failed', 'error');
      } finally {
        setAiResponding(false);
        setAnalyzing(false);
      }
    }
  };

  const handleOpenDiff = () => {
    if (activeReview?.prUrl) {
      window.open(activeReview.prUrl, '_blank', 'noopener,noreferrer');
      showToast('Opening diff in GitHub', 'info');
    } else {
      showToast('No PR URL available', 'error');
    }
  };

  const handleCreate = async () => {
    if (!selectedRepoId) {
      setError('Please select a repository');
      return;
    }
    if (!prUrl && !diffContent) {
      setError('Please provide a PR URL or paste diff content');
      return;
    }
    try {
      setCreating(true);
      setError('');
      const res = await api.reviews.create({
        repositoryId: selectedRepoId,
        prUrl: prUrl || undefined,
        diffContent: diffContent || undefined,
      });
      setActiveReview(res.session);
      setMode('detail');
      setPrUrl('');
      setDiffContent('');
      loadReviews();
    } catch (err: any) {
      setError(err.message || 'Failed to create review');
    } finally {
      setCreating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!activeReview) return;
    try {
      setAnalyzing(true);
      setError('');
      showToast('AI analysis started...', 'info');
      const res = await api.reviews.analyze(activeReview.id);
      showToast('Review analysis complete!', 'success');
      setActiveReview(res.session);
      loadReviews();
    } catch (err: any) {
      showToast(err.message || 'Analysis failed', 'error');
      setError(err.message || 'Failed to analyze review');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      setError('');
      await api.reviews.delete(id);
      showToast('Review deleted', 'success');
      setShowDeleteConfirm(false);
      if (activeReview?.id === id) {
        setActiveReview(null);
        setMode('list');
      }
      loadReviews();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete review', 'error');
      setError(err.message || 'Failed to delete review');
    } finally {
      setDeleting(false);
    }
  };

  const handleSelectReview = async (id: string) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.reviews.get(id);
      setActiveReview(res.session);
      setMode('detail');
    } catch (err: any) {
      setError(err.message || 'Failed to load review');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-400 bg-emerald-400/10';
      case 'analyzing': return 'text-accent bg-accent/10';
      case 'failed': return 'text-red-400 bg-red-400/10';
      default: return 'text-neutral-500 bg-white/[0.04]';
    }
  };

  const getRiskColor = (level: string | null) => {
    switch (level) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-amber-400';
      case 'low': return 'text-emerald-400';
      default: return 'text-neutral-500';
    }
  };

  if (mode === 'create') {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => { setMode('list'); setError(''); }} className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-200 transition-colors">
              &larr; Back
            </button>
            <h1 className="text-lg font-semibold text-white">New Review</h1>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-neutral-300 mb-2 block">Repository</label>
              <select
                value={selectedRepoId}
                onChange={e => setSelectedRepoId(e.target.value)}
                className="rounded-lg border border-white/[0.08] bg-[#0d1117] px-4 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-accent/50 transition-colors min-w-[280px]"
              >
                {repositories.map(r => (
                  <option key={r.id} value={r.id}>{r.fullName}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setInputMode('pr-picker')}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${inputMode === 'pr-picker' ? 'bg-accent/10 text-accent' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                <GitPullRequest size={14} className="inline mr-1" />
                Recent PRs
              </button>
              <button
                onClick={() => setInputMode('pr-url')}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${inputMode === 'pr-url' ? 'bg-accent/10 text-accent' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                <ExternalLink size={14} className="inline mr-1" />
                PR URL
              </button>
              <button
                onClick={() => setInputMode('diff-paste')}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${inputMode === 'diff-paste' ? 'bg-accent/10 text-accent' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                <FileText size={14} className="inline mr-1" />
                Paste Diff
              </button>
            </div>
          </div>

          {inputMode === 'pr-picker' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-neutral-300">Recent Pull Requests</label>
                {selectedRepoId && (
                  <button
                    onClick={() => loadRecentPrs(selectedRepoId)}
                    className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw size={12} />
                    Refresh
                  </button>
                )}
              </div>

              {prsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={20} className="text-accent animate-spin" />
                </div>
              ) : prsError ? (
                <div className="rounded-lg bg-amber-400/10 border border-amber-400/20 px-4 py-3">
                  <p className="text-sm text-amber-400 flex items-center gap-2">
                    <AlertTriangle size={14} />
                    {prsError}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1.5">
                    Try pasting a PR URL or diff manually instead
                  </p>
                  <button
                    onClick={() => setInputMode('pr-url')}
                    className="text-xs text-accent hover:underline mt-1.5"
                  >
                    Switch to PR URL input
                  </button>
                </div>
              ) : recentPrs.length === 0 ? (
                <div className="rounded-lg border border-dashed border-white/[0.06] p-8 text-center">
                  <GitPullRequest size={24} className="mx-auto mb-2 text-neutral-600" />
                  <p className="text-sm text-neutral-500">No open pull requests found</p>
                  <p className="text-xs text-neutral-600 mt-1">Create a PR on GitHub or paste a diff manually</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentPrs.map((pr) => (
                    <button
                      key={pr.number}
                      onClick={() => handleQuickCreate(pr)}
                      disabled={creating}
                      className="w-full text-left rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-accent/20 p-4 transition-all group disabled:opacity-50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-neutral-200 truncate group-hover:text-accent transition-colors">
                              {pr.title}
                            </span>
                            {pr.draft && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-500/10 text-neutral-500 shrink-0">
                                Draft
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-500">
                            <span className="flex items-center gap-1">
                              <User size={11} />
                              {pr.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <GitBranch size={11} />
                              {pr.headBranch}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={11} />
                              {timeAgo(pr.updatedAt)}
                            </span>
                          </div>
                          {pr.labels?.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2">
                              {pr.labels.map((label: any, i: number) => (
                                <span
                                  key={i}
                                  className="text-[10px] px-1.5 py-0.5 rounded"
                                  style={{
                                    backgroundColor: `#${label.color}20`,
                                    color: `#${label.color}`,
                                  }}
                                >
                                  {label.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 mt-0.5">
                          <span className="text-xs text-neutral-600 font-mono">#{pr.number}</span>
                          <ArrowRight size={14} className="text-neutral-600 group-hover:text-accent transition-colors" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {inputMode === 'pr-url' && (
            <div>
              <label className="text-sm font-medium text-neutral-300 mb-2 block">GitHub PR URL</label>
              <input
                type="text"
                value={prUrl}
                onChange={e => setPrUrl(e.target.value)}
                placeholder="https://github.com/owner/repo/pull/123"
                className="w-full rounded-lg border border-white/[0.08] bg-[#0d1117] px-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-accent/50 transition-colors"
              />
              <p className="text-xs text-neutral-600 mt-1.5">Paste any GitHub pull request URL to fetch the diff</p>
            </div>
          )}

          {inputMode === 'diff-paste' && (
            <div>
              <label className="text-sm font-medium text-neutral-300 mb-2 block">Diff Content</label>
              <textarea
                value={diffContent}
                onChange={e => setDiffContent(e.target.value)}
                rows={10}
                placeholder="Paste your git diff output here..."
                className="w-full rounded-lg border border-white/[0.08] bg-[#0d1117] px-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-600 font-mono focus:outline-none focus:border-accent/50 transition-colors resize-y"
              />
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-400/10 border border-red-400/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-white/[0.06] pt-5">
            <p className="text-xs text-neutral-600">
              {inputMode === 'pr-picker' && 'Click a pull request to start the review'}
              {inputMode === 'pr-url' && 'Enter a PR URL then click Start Review'}
              {inputMode === 'diff-paste' && 'Paste a diff then click Start Review'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setMode('list'); setError(''); }}
                className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-5 py-2.5 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Cancel
              </button>
              {(inputMode === 'pr-url' || inputMode === 'diff-paste') && (
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex items-center gap-2 rounded-lg bg-accent/10 px-5 py-2.5 text-sm font-medium text-accent hover:bg-accent/20 disabled:opacity-50 transition-colors"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {creating ? 'Starting...' : 'Start Review'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'detail' && activeReview) {
    const isAnalyzing = analyzing || activeReview.status === 'analyzing';
    const isCompleted = activeReview.status === 'completed';
    const isFailed = activeReview.status === 'failed';

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => { setMode('list'); setActiveReview(null); setError(''); }} className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-200 transition-colors">
              &larr; Back
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete review"
              className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <Trash2 size={15} /> Delete PR
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-400/10 border border-red-400/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <PRHeader
          title={activeReview.title || 'PR Review'}
          branch={activeReview.headBranch || 'unknown'}
          baseBranch={activeReview.baseBranch || 'main'}
          author={activeReview.author || 'unknown'}
          status={activeReview.status === 'completed' ? 'Reviewed' : activeReview.status === 'analyzing' ? 'Analyzing' : 'Pending'}
          mergeReady={activeReview.mergeReady || 0}
          onAskAI={handleAskAI}
          onOpenDiff={handleOpenDiff}
          analyzing={isAnalyzing}
        />

        <PRSummaryHero
          review={activeReview}
          analyzing={isAnalyzing}
          onAnalyze={handleAnalyze}
        />

        <InsightCards
          review={activeReview}
          analyzing={isAnalyzing}
        />

        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
              <CategorizedFileList files={activeReview.files || []} />
            </div>
          </div>

          <div className="space-y-6">
            <AISuggestions suggestions={activeReview.suggestions || []} loading={isAnalyzing} />
            <AIReport
              review={activeReview}
              analyzing={isAnalyzing}
            />
            <ReviewTimeline
              review={activeReview}
              analyzing={isAnalyzing}
            />
          </div>
        </div>

        {isFailed && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-6 text-center">
            <AlertTriangle size={24} className="mx-auto mb-2 text-red-400" />
            <p className="text-sm text-neutral-300">AI review analysis failed. Please try again.</p>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="rounded-xl border border-white/[0.06] bg-[#0d1117] p-6 w-full max-w-sm mx-4 shadow-2xl">
              <h3 className="text-sm font-semibold text-white mb-2">Delete this review?</h3>
              <p className="text-xs text-neutral-400 mb-5">This will permanently delete the review session and all its data. This action cannot be undone.</p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(activeReview.id)}
                  disabled={deleting}
                  className="flex items-center gap-2 rounded-lg bg-red-400/10 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-400/20 transition-colors disabled:opacity-50"
                >
                  {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Pull Request Reviews</h1>
          <p className="text-sm text-neutral-500 mt-0.5">AI-powered review for your pull requests</p>
        </div>
        <button
          onClick={() => { setMode('create'); setError(''); }}
          className="flex items-center gap-2 rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
        >
          <Plus size={16} />
          New Review
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-400/10 border border-red-400/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="text-accent animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <GitPullRequest size={24} className="text-accent" />
            </div>
          </div>
          <h3 className="text-base font-medium text-neutral-300 mb-1">No reviews yet</h3>
          <p className="text-sm text-neutral-500 mb-6">Start by reviewing a pull request from GitHub or paste a diff manually</p>
          <button
            onClick={() => { setMode('create'); setError(''); }}
            className="inline-flex items-center gap-2 rounded-lg bg-accent/10 px-5 py-2.5 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
          >
            <Plus size={16} />
            Start First Review
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              onClick={() => handleSelectReview(review.id)}
              className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 mt-0.5 shrink-0">
                    <GitPullRequest size={16} className="text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-neutral-200 truncate">{review.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                      {review.author && <span>{review.author}</span>}
                      {review.prUrl && (
                        <a href={review.prUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-1 text-accent hover:underline">
                          <ExternalLink size={11} />
                          PR #{review.prNumber}
                        </a>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${getStatusColor(review.status)}`}>
                    {review.status}
                  </span>
                  {review.riskLevel && (
                    <span className={`text-[11px] font-medium ${getRiskColor(review.riskLevel)}`}>
                      {review.riskLevel} risk
                    </span>
                  )}
                  <span className="text-xs text-neutral-500">
                    {review._count?.suggestions || 0} issues
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(review.id); }}
                    className="p-1.5 rounded-lg hover:bg-white/[0.04] text-neutral-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
