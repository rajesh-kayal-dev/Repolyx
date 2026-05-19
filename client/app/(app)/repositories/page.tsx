'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Github,
  Search,
  ChevronDown,
  Check,
  Loader2,
  AlertTriangle,
  Plus,
  BookOpen,
  Sparkles,
  GitBranch,
  Clock,
  FileCode,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import type { Repository, GitHubRepo } from '@/lib/types';

const SCAN_STEPS = [
  'Importing repository...',
  'Fetching repository structure...',
  'Reading dependencies...',
  'Analyzing architecture...',
  'Generating AI summary...',
  'Ready',
];

export default function RepositoriesPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [importedRepos, setImportedRepos] = useState<Repository[]>([]);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'imported' | 'available'>('all');

  const [importingRepoId, setImportingRepoId] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importStep, setImportStep] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    loadRepositories();
  }, [isMounted]);

  const loadRepositories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [importedRes, githubRes] = await Promise.all([
        api.repositories.list().catch(() => ({ repositories: [] })),
        api.repositories.fetchGithub().catch(() => ({ repositories: [] })),
      ]);

      setImportedRepos(importedRes.repositories || []);
      setGithubRepos(githubRes.repositories || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load repositories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (repo: GitHubRepo) => {
    try {
      setImportingRepoId(repo.id);
      setImportProgress(0);
      setImportStep(0);
      setImportError(null);

      const steps = [2000, 1500, 1500, 2000, 2000, 500];
      for (let i = 0; i < steps.length; i++) {
        setImportStep(i);
        setImportProgress(Math.round(((i + 1) / steps.length) * 100));
        if (i < steps.length - 1) {
          await new Promise((r) => setTimeout(r, steps[i]));
        }
      }

      const res = await api.repositories.importAndScan(repo, repo.defaultBranch || 'main');

      setImportStep(SCAN_STEPS.length - 1);
      setImportProgress(100);

      await new Promise((r) => setTimeout(r, 500));

      setImportingRepoId(null);
      setImportProgress(0);

      await loadRepositories();
      router.push(`/repositories/${res.repository.id}`);
    } catch (e: any) {
      setImportError(e.message || 'Import failed');
      setImportingRepoId(null);
    }
  };

  const importedGithubIds = useMemo(() => {
    return new Set(importedRepos.map((r) => r.githubRepoId));
  }, [importedRepos]);

  const mergedRepos = useMemo(() => {
    const seen = new Map<string, any>();

    importedRepos.forEach((r) => {
      seen.set(r.id, {
        id: r.id,
        githubRepoId: r.githubRepoId,
        name: r.name,
        fullName: r.fullName,
        description: r.description || 'No description',
        language: r.language || 'Unknown',
        visibility: r.visibility,
        updatedAt: r.updatedAt,
        isImported: true,
        isIndexed: r.isIndexed,
        scanStatus: r.scanStatus,
        fromDb: true,
      });
    });

    githubRepos.forEach((r) => {
      if (!importedGithubIds.has(r.id)) {
        seen.set(`github-${r.id}`, {
          id: r.id,
          name: r.name,
          fullName: r.fullName,
          description: r.description || 'No description',
          language: r.language || 'Unknown',
          visibility: r.visibility,
          updatedAt: r.lastUpdated,
          isImported: false,
          isIndexed: false,
          scanStatus: null,
          fromDb: false,
        });
      }
    });

    return Array.from(seen.values());
  }, [importedRepos, githubRepos, importedGithubIds]);

  const filteredRepos = useMemo(() => {
    return mergedRepos.filter((repo) => {
      const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (repo.language && repo.language.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedFilter === 'imported') return repo.isImported;
      if (selectedFilter === 'available') return !repo.isImported;

      return true;
    });
  }, [mergedRepos, searchQuery, selectedFilter]);

  const languages = useMemo(() => {
    const set = new Set<string>();
    mergedRepos.forEach((r) => { if (r.language && r.language !== 'Unknown') set.add(r.language); });
    return Array.from(set).sort();
  }, [mergedRepos]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  if (!isMounted || isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-neutral-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <AlertTriangle size={24} className="text-amber-400 mx-auto mb-3" />
        <h2 className="text-sm font-semibold text-white mb-1">Failed to load repositories</h2>
        <p className="text-xs text-neutral-500 mb-4">{error}</p>
        <button
          onClick={loadRepositories}
          className="rounded-md border border-white/[0.06] px-3 py-1.5 text-xs text-neutral-400 hover:bg-white/[0.03] transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.08]">
            <Github size={16} className="text-neutral-400" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">Repositories</h1>
            <p className="text-[11px] text-neutral-500">{importedRepos.length} imported · {githubRepos.length} available</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/[0.06] bg-[#090d14] py-2 pl-9 pr-3 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-white/[0.12] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'imported', 'available'].map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFilter(f as any)}
              className={`rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors ${
                selectedFilter === f
                  ? 'border-accent/30 bg-accent/5 text-accent'
                  : 'border-white/[0.06] text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200'
              }`}
            >
              {f === 'all' ? 'All' : f === 'imported' ? 'Imported' : 'Available'}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-white/[0.06] divide-y divide-white/[0.03]">
        {filteredRepos.length === 0 && (
          <div className="py-16 text-center">
            <Github size={24} className="text-neutral-700 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-neutral-400 mb-1">No repositories found</h3>
            <p className="text-[11px] text-neutral-600 max-w-sm mx-auto">
              {searchQuery
                ? 'Try a different search query'
                : 'Connect your GitHub account to see your repositories'}
            </p>
          </div>
        )}

        {filteredRepos.map((repo) => (
          <div
            key={repo.fromDb ? repo.id : `github-${repo.id}`}
            className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.015] transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white truncate">{repo.name}</span>
                <span
                  className={`shrink-0 text-[10px] leading-none px-1.5 py-0.5 rounded-sm border ${
                    repo.visibility === 'Public' || repo.visibility === 'public'
                      ? 'border-emerald-500/15 text-emerald-400/80'
                      : 'border-amber-500/15 text-amber-400/80'
                  }`}
                >
                  {repo.visibility}
                </span>
                {repo.isImported && (
                  <span
                    className={`shrink-0 text-[10px] leading-none px-1.5 py-0.5 rounded-sm border ${
                      repo.isIndexed
                        ? 'border-emerald-500/15 text-emerald-400/80'
                        : 'border-amber-500/15 text-amber-400/80'
                    }`}
                  >
                    {repo.isIndexed ? 'Indexed' : 'Pending'}
                  </span>
                )}
              </div>

              <p className="text-[12px] text-neutral-500 mt-0.5 line-clamp-1 max-w-xl">
                {repo.description}
              </p>

              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-neutral-500">
                <span className="flex items-center gap-1">
                  <FileCode size={11} className="text-neutral-600" />
                  {repo.language}
                </span>
                <span className="w-0.5 h-0.5 rounded-full bg-neutral-700" />
                <span className="flex items-center gap-1">
                  <Clock size={11} className="text-neutral-600" />
                  Updated {formatDate(repo.updatedAt)}
                </span>
                {repo.scanStatus && (
                  <>
                    <span className="w-0.5 h-0.5 rounded-full bg-neutral-700" />
                    <span className="flex items-center gap-1 text-neutral-600">
                      <GitBranch size={11} />
                      {repo.scanStatus}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {repo.isImported && repo.isIndexed && (
                <button
                  onClick={() => router.push(`/repositories/${repo.id}`)}
                  className="rounded-md border border-accent/20 bg-accent/5 px-3 py-1.5 text-[11px] font-medium text-accent hover:bg-accent/10 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <ExternalLink size={11} />
                    Open
                  </span>
                </button>
              )}

              {repo.isImported && !repo.isIndexed && (
                <button
                  onClick={() => handleImport(repo)}
                  disabled={importingRepoId === repo.id}
                  className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 text-[11px] font-medium text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
                >
                  Re-index
                </button>
              )}

              {!repo.isImported && (
                <button
                  onClick={() => handleImport(repo)}
                  disabled={importingRepoId === repo.id}
                  className="rounded-md border border-white/[0.08] px-3 py-1.5 text-[11px] font-medium text-neutral-300 hover:bg-white/[0.04] hover:border-accent/25 hover:text-accent transition-colors disabled:opacity-50"
                >
                  {importingRepoId === repo.id ? 'Importing...' : 'Import'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {importingRepoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm mx-4 rounded-lg border border-white/[0.08] bg-[#0a0e14] shadow-lg p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-8 w-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                <Github size={16} className="text-neutral-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Importing repository</h3>
                <p className="text-[11px] text-neutral-500">
                  {filteredRepos.find((r) => r.id === importingRepoId || `github-${r.id}` === `github-${importingRepoId}`)?.name}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 mb-4">
              {SCAN_STEPS.map((step, idx) => {
                const isCompleted = idx < importStep;
                const isActive = idx === importStep;
                return (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                      {isCompleted && <Check size={12} className="text-emerald-400" />}
                      {isActive && <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />}
                      {!isCompleted && !isActive && <div className="h-2 w-2 rounded-full bg-neutral-800" />}
                    </div>
                    <span className={`text-xs ${isCompleted ? 'text-neutral-400' : isActive ? 'text-white font-medium' : 'text-neutral-600'}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-neutral-500">
                <span>Progress</span>
                <span>{importProgress}%</span>
              </div>
              <div className="w-full bg-neutral-900 rounded-full h-1 overflow-hidden">
                <div className="bg-accent h-1 transition-all duration-300 ease-out" style={{ width: `${importProgress}%` }} />
              </div>
            </div>

            {importError && (
              <div className="mt-3 flex items-center gap-2 text-[11px] text-red-400 bg-red-400/5 border border-red-400/10 rounded-md px-3 py-2">
                <AlertTriangle size={11} />
                {importError}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
