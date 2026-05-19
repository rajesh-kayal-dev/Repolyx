'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github,
  Plus,
  Search,
  Folder,
  ChevronDown,
  ChevronRight,
  GitBranch,
  Check,
  Loader2,
  Info,
  AlertTriangle,
  CheckCircle2,
  GitCommit,
  X,
  FileCode,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FolderOpen,
  BookOpen,
  Zap,
  Shield,
  FileText,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api-client';
import type { Repository, RepositoryFile, RepositoryEvent, TreeNode, ChatMessage, ScanStatus, GitHubRepo } from '@/lib/types';

const SCAN_STEPS = [
  'Connecting to GitHub...',
  'Scanning repository structure...',
  'Reading dependencies...',
  'Analyzing architecture...',
  'Generating AI summary...',
  'Indexing completed',
];

export default function RepositoryWorkspacePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [importedRepos, setImportedRepos] = useState<Repository[]>([]);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [activeRepoId, setActiveRepoId] = useState<string | null>(null);
  const [activeRepo, setActiveRepo] = useState<Repository | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [repoSearchQuery, setRepoSearchQuery] = useState('');
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('main');

  const [fileTree, setFileTree] = useState<TreeNode[]>([]);
  const [files, setFiles] = useState<RepositoryFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<RepositoryFile | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [selectedFileExplanation, setSelectedFileExplanation] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  const [events, setEvents] = useState<RepositoryEvent[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const [aiChatQuery, setAiChatQuery] = useState('');
  const [aiChatResponses, setAiChatResponses] = useState<ChatMessage[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isBranchSelectorOpen, setIsBranchSelectorOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const branchSelectorRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);

  const [importSetupRepo, setImportSetupRepo] = useState<GitHubRepo | null>(null);
  const [importBranch, setImportBranch] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedId = localStorage.getItem('repolyx_active_repo_id');
    if (storedId) setActiveRepoId(storedId);
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

      const repos = importedRes.repositories || [];
      setImportedRepos(repos);
      setGithubRepos(githubRes.repositories || []);

      if (repos.length > 0) {
        const storedId = localStorage.getItem('repolyx_active_repo_id');
        const isKnownId = storedId && (
          repos.find((r: Repository) => r.id === storedId) ||
          repos.find((r: Repository) => r.githubRepoId === storedId)
        );
        const validId = isKnownId ? storedId! : repos[0].id;
        localStorage.setItem('repolyx_active_repo_id', validId);
        setActiveRepoId(validId);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load repositories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeRepoId) {
      localStorage.setItem('repolyx_active_repo_id', activeRepoId);
      loadActiveRepo(activeRepoId);
    }
  }, [activeRepoId]);

  const loadActiveRepo = async (id: string) => {
    try {
      const res = await api.repositories.get(id);
      const repo = res.repository;
      setActiveRepo(repo);
      setSummary(repo.aiSummary);
      setSelectedBranch(repo.defaultBranch || 'main');
      setSelectedFile(null);
      setSelectedFileContent(null);
      setSelectedFileExplanation(null);
      setAiChatResponses([]);
      setEvents(repo.events || []);
      setAnalyses(repo.analyses || []);

      if (repo.isIndexed) {
        loadFileTree(id);
      }
    } catch (e: any) {
      console.error('Failed to load active repo:', e);
      localStorage.removeItem('repolyx_active_repo_id');
      if (importedRepos.length > 0) {
        const fallbackId = importedRepos[0].id;
        localStorage.setItem('repolyx_active_repo_id', fallbackId);
        setActiveRepoId(fallbackId);
      }
    }
  };

  const loadFileTree = async (id: string) => {
    try {
      const res = await api.repositories.getTree(id);
      setFileTree(res.tree || []);
      setFiles(res.files || []);
    } catch (e: any) {
      console.error('Failed to load file tree:', e);
    }
  };

  const handleImportFlow = async (repo: GitHubRepo) => {
    try {
      setImportSetupRepo(repo);
      setImportBranch(repo.defaultBranch || 'main');
    } catch (e: any) {
      console.error('Error setting up import:', e);
    }
  };

  const startImport = async () => {
    if (!importSetupRepo) return;

    try {
      setIsImporting(true);
      setScanStatus({
        status: 'importing',
        message: 'Importing repository...',
        progress: 0,
        step: SCAN_STEPS[0],
      });

      const importRes = await api.repositories.import(importSetupRepo);
      const repo = importRes.repository;

      setScanStatus({
        status: 'scanning',
        message: 'Starting repository scan...',
        progress: 20,
        step: SCAN_STEPS[1],
      });

      const scanRes = await api.repositories.scan(repo.id, importBranch);

      setScanStatus({
        status: 'summarizing',
        message: 'Generating AI summary...',
        progress: 60,
        step: SCAN_STEPS[4],
      });

      await api.repositories.generateSummary(repo.id);

      setScanStatus({
        status: 'completed',
        message: 'Repository indexed successfully',
        progress: 100,
        step: SCAN_STEPS[5],
      });

      setActiveRepoId(repo.id);
      setImportSetupRepo(null);

      setTimeout(() => {
        setScanStatus(null);
        loadRepositories();
      }, 1000);
    } catch (e: any) {
      setScanStatus({
        status: 'failed',
        message: e.message || 'Import failed',
        progress: 0,
        step: 'Failed',
      });
      console.error('Import failed:', e);
    } finally {
      setIsImporting(false);
    }
  };

  const handleScan = async () => {
    if (!activeRepo) return;
    try {
      setIsScanning(true);
      setScanStatus({
        status: 'scanning',
        message: 'Scanning repository...',
        progress: 10,
        step: SCAN_STEPS[1],
      });

      await api.repositories.scan(activeRepo.id, selectedBranch);

      setScanStatus({
        status: 'completed',
        message: 'Repository scan completed',
        progress: 100,
        step: SCAN_STEPS[5],
      });

      await loadActiveRepo(activeRepo.id);

      setTimeout(() => setScanStatus(null), 1500);
    } catch (e: any) {
      setScanStatus({ status: 'failed', message: e.message, progress: 0, step: 'Failed' });
    } finally {
      setIsScanning(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!activeRepo || isGeneratingSummary) return;
    try {
      setIsGeneratingSummary(true);
      const res = await api.repositories.generateSummary(activeRepo.id);
      setSummary(res.summary);
    } catch (e: any) {
      console.error('Failed to generate summary:', e);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleRunAnalysis = async (type: string) => {
    if (!activeRepo) return;
    try {
      const res = await api.repositories.analyze(activeRepo.id, type);
      setAnalyses((prev) => [res.analysis, ...prev]);
      if (activeRepo.id) loadEvents(activeRepo.id);
    } catch (e: any) {
      console.error('Analysis failed:', e);
    }
  };

  const loadEvents = async (id: string) => {
    try {
      const res = await api.repositories.getEvents(id);
      setEvents(res.events || []);
    } catch {}
  };

  const handleFileClick = async (file: RepositoryFile) => {
    if (!activeRepo) return;
    setSelectedFile(file);
    setIsLoadingFile(true);
    try {
      const res = await api.repositories.getFile(activeRepo.id, file.id, selectedBranch);
      const fileData = res.file;
      setSelectedFileContent(fileData.content || '// No content available');
      setSelectedFileExplanation(fileData.explanation || null);
    } catch (e: any) {
      console.error('Failed to load file:', e);
      setSelectedFileContent('// Failed to load file content');
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleAiChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatQuery.trim() || !activeRepo || isAiThinking) return;

    const query = aiChatQuery.trim();
    setAiChatResponses((prev) => [...prev, { role: 'user', text: query }]);
    setAiChatQuery('');
    setIsAiThinking(true);

    try {
      const res = await api.repositories.query(
        activeRepo.id,
        query,
        selectedFile?.path,
        selectedBranch
      );
      setAiChatResponses((prev) => [...prev, { role: 'assistant', text: res.answer }]);
    } catch (e: any) {
      setAiChatResponses((prev) => [
        ...prev,
        { role: 'assistant', text: `Error: ${e.message || 'Failed to get response'}` },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChatResponses]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) setIsSwitcherOpen(false);
      if (branchSelectorRef.current && !branchSelectorRef.current.contains(event.target as Node)) setIsBranchSelectorOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFolder = (path: string) => {
    setCollapsedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const filteredReposToImport = useMemo(() => {
    return githubRepos.filter(
      (repo) =>
        !repo.isImported &&
        repo.name.toLowerCase().includes(repoSearchQuery.toLowerCase())
    );
  }, [repoSearchQuery, githubRepos]);

  const renderTree = (nodes: TreeNode[], depth = 0) => {
    return nodes.map((node) => {
      if (node.type === 'directory') {
        const isCollapsed = collapsedFolders[node.path];
        const filteredChildren = fileSearchQuery
          ? filterTree(node.children || [], fileSearchQuery)
          : node.children || [];

        return (
          <div key={node.path}>
            <button
              onClick={() => toggleFolder(node.path)}
              className="flex w-full items-center gap-1.5 rounded px-2 py-1 hover:bg-white/[0.04] transition-colors group"
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
              <ChevronRight
                size={11}
                className={`text-neutral-500 transition-transform shrink-0 ${!isCollapsed ? 'rotate-90' : ''}`}
              />
              <Folder size={12} className="text-accent/70 shrink-0" />
              <span className="text-[11px] font-medium text-neutral-300 truncate flex-1 text-left">
                {node.name}
              </span>
              <span className="text-[10px] text-neutral-600">{filteredChildren.length}</span>
            </button>
            {!isCollapsed && filteredChildren.length > 0 && (
              <div>{renderTree(filteredChildren, depth + 1)}</div>
            )}
          </div>
        );
      }

      const isActive = selectedFile?.path === node.path;
      return (
        <button
          key={node.path}
          onClick={() => {
            const file = files.find((f) => f.path === node.path);
            if (file) handleFileClick(file);
          }}
          className={`flex w-full items-center gap-2 rounded px-2 py-1 text-[11px] text-left transition-colors ${
            isActive
              ? 'bg-accent/5 text-accent font-medium'
              : 'text-neutral-400 hover:bg-white/[0.02] hover:text-neutral-200'
          }`}
          style={{ paddingLeft: `${depth * 12 + 24}px` }}
        >
          <FileCode size={11} className={isActive ? 'text-accent shrink-0' : 'text-neutral-600 shrink-0'} />
          <span className="truncate flex-1">{node.name}</span>
          {node.isImportant && (
            <span className="shrink-0 text-[9px] font-medium px-1 py-0.5 rounded bg-accent/10 text-accent border border-accent/15">
              AI
            </span>
          )}
        </button>
      );
    });
  };

  const filterTree = (nodes: TreeNode[], query: string): TreeNode[] => {
    return nodes
      .map((node) => {
        if (node.type === 'directory') {
          const children = filterTree(node.children || [], query);
          if (children.length > 0) return { ...node, children };
          return null;
        }
        if (node.name.toLowerCase().includes(query.toLowerCase())) return node;
        return null;
      })
      .filter(Boolean) as TreeNode[];
  };

  if (!isMounted) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-neutral-500" />
      </div>
    );
  }

  if (scanStatus && scanStatus.status !== 'completed' && scanStatus.status !== 'failed') {
    const currentIdx = SCAN_STEPS.indexOf(scanStatus.step);
    return (
      <div className="max-w-lg mx-auto py-16 px-4">
        <div className="rounded-xl border border-white/[0.06] bg-[#090d14] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
              <Github size={16} className="text-neutral-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Processing repository</h2>
              <p className="text-xs text-neutral-500 mt-0.5">{importSetupRepo?.name || activeRepo?.name}</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {SCAN_STEPS.map((step, idx) => {
              const isCompleted = idx < currentIdx;
              const isActive = idx === currentIdx;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {isCompleted && <Check size={12} className="text-emerald-400" />}
                    {isActive && <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />}
                    {!isCompleted && !isActive && <div className="h-2 w-2 rounded-full bg-neutral-800" />}
                  </div>
                  <span
                    className={`text-xs ${
                      isCompleted
                        ? 'text-neutral-400'
                        : isActive
                        ? 'text-white font-medium'
                        : 'text-neutral-600'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-neutral-500">
              <span>Progress</span>
              <span>{scanStatus.progress}%</span>
            </div>
            <div className="w-full bg-neutral-900 rounded-full h-1 overflow-hidden">
              <div
                className="bg-accent h-1 transition-all duration-500 ease-out"
                style={{ width: `${scanStatus.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 px-1">
        <div className="max-w-md mx-auto text-center py-12">
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
      </div>
    );
  }

  if (importedRepos.length === 0 && !isLoading) {
    return (
      <div className="py-8 px-1">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Github size={18} className="text-neutral-400" />
                  <h1 className="text-base font-semibold text-white">Import Repository</h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search repositories..."
                  value={repoSearchQuery}
                  onChange={(e) => setRepoSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.06] bg-[#090d14] py-1.5 pl-9 pr-3 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-white/[0.12] transition-colors"
                />
              </div>
            </div>

            <div className="rounded-lg border border-white/[0.06] divide-y divide-white/[0.03] max-h-[580px] overflow-y-auto">
              {filteredReposToImport.map((repo) => (
                <div
                  key={repo.id}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.015] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">{repo.name}</span>
                      <span
                        className={`shrink-0 text-[10px] leading-none px-1.5 py-0.5 rounded-sm border ${
                          repo.visibility === 'Public'
                            ? 'border-emerald-500/15 text-emerald-400/80'
                            : 'border-amber-500/15 text-amber-400/80'
                        }`}
                      >
                        {repo.visibility}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 mt-0.5 text-[11px] text-neutral-500">
                      <span>{repo.language}</span>
                      <span className="w-0.5 h-0.5 rounded-full bg-neutral-600" />
                      <span>{repo.stack}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleImportFlow(repo)}
                    className="shrink-0 ml-3 rounded-md border border-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-neutral-500 hover:bg-white/[0.04] hover:border-accent/25 hover:text-accent transition-colors"
                  >
                    Import
                  </button>
                </div>
              ))}
              {filteredReposToImport.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-xs text-neutral-600">No repositories found</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-white/[0.06] bg-[#090d14] px-3.5 py-3">
              <h3 className="text-[11px] font-semibold text-neutral-300 mb-2.5">Getting Started</h3>
              <div className="space-y-2">
                {[
                  { step: '1', title: 'Connect', desc: 'Link your GitHub account' },
                  { step: '2', title: 'Select', desc: 'Choose a repository' },
                  { step: '3', title: 'Explore', desc: 'Review AI-powered insights' },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-2.5">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-white/[0.06]">
                      <span className="text-[9px] font-semibold text-neutral-500">{item.step}</span>
                    </div>
                    <div>
                      <p className="text-[11px] text-neutral-400">{item.title}</p>
                      <p className="text-[10px] text-neutral-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-white/[0.06] bg-[#090d14] px-3.5 py-3">
              <h3 className="text-[11px] font-semibold text-neutral-300 mb-2.5">Features</h3>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {['Architecture Map', 'Dependency Graph', 'Auto Docs', 'Code Search', 'Security Scan', 'AI Chat'].map(
                  (feat) => (
                    <div key={feat} className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-accent/60" />
                      <span className="text-[10px] text-neutral-500">{feat}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="rounded-lg border border-white/[0.06] bg-[#090d14] px-3.5 py-3">
              <h3 className="text-[11px] font-semibold text-neutral-300 mb-1.5">How It Works</h3>
              <p className="text-[10px] text-neutral-500 leading-relaxed">
                Connects to your repositories and runs analysis to map code structure, dependencies, APIs, and security patterns into an interactive workspace.
              </p>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {importSetupRepo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
              onClick={() => setImportSetupRepo(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[520px] mx-4 rounded-lg border border-white/[0.08] bg-[#0a0e14] shadow-lg"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Import Repository</h2>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Prepare this repository for AI indexing and analysis.</p>
                  </div>
                  <button
                    onClick={() => setImportSetupRepo(null)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 hover:bg-white/[0.05] transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="px-5 py-3 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2.5">
                    <Github size={14} className="text-neutral-400 shrink-0" />
                    <div>
                      <p className="text-[13px] font-medium text-white">{importSetupRepo.name}</p>
                      <p className="text-[11px] text-neutral-500">github.com/{importSetupRepo.name} · {importSetupRepo.visibility} repository</p>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4">
                  <div>
                    <label className="text-[11px] font-medium text-neutral-400 mb-1.5 block">Branch</label>
                    <div className="relative inline-block">
                      <select
                        value={importBranch}
                        onChange={(e) => setImportBranch(e.target.value)}
                        className="appearance-none rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 pr-8 text-xs text-neutral-300 outline-none focus:border-accent/40 transition-colors cursor-pointer"
                      >
                        {[importSetupRepo.defaultBranch || 'main'].map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                      <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-white/[0.05]">
                  <button
                    onClick={() => setImportSetupRepo(null)}
                    className="rounded-md border border-white/[0.08] px-3.5 py-1.5 text-xs text-neutral-400 hover:bg-white/[0.04] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={startImport}
                    disabled={isImporting}
                    className="rounded-md bg-accent px-3.5 py-1.5 text-xs font-medium text-black hover:bg-accent/90 transition-colors disabled:opacity-50"
                  >
                    {isImporting ? 'Importing...' : 'Start Analysis'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
        <span className="text-xs text-neutral-500 font-mono tracking-wider">LOADING WORKSPACE...</span>
      </div>
    );
  }

  if (!activeRepo) return null;

  const eventIconMap: Record<string, any> = {
    imported: { icon: Github, color: 'text-sky-400' },
    indexed: { icon: CheckCircle2, color: 'text-emerald-400' },
    analyzed: { icon: Search, color: 'text-purple-400' },
    dependencies_scanned: { icon: Zap, color: 'text-amber-400' },
    auth_analyzed: { icon: Shield, color: 'text-teal-400' },
    api_analyzed: { icon: FileCode, color: 'text-blue-400' },
    docs_generated: { icon: BookOpen, color: 'text-indigo-400' },
    summary_generated: { icon: Sparkles, color: 'text-accent' },
  };

  const availableAnalyses = [
    { type: 'architecture', label: 'Architecture', icon: FolderOpen },
    { type: 'dependencies', label: 'Dependencies', icon: Zap },
    { type: 'auth', label: 'Auth Flow', icon: Shield },
    { type: 'api', label: 'API Routes', icon: FileCode },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-white/[0.04] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative" ref={switcherRef}>
            <button
              onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
              className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#090d14] px-3 py-1.5 text-sm font-medium text-white hover:bg-white/[0.03] hover:border-white/[0.1] transition-all"
            >
              <Github size={14} className="text-neutral-400" />
              <span>{activeRepo.name}</span>
              <ChevronDown size={13} className="text-neutral-500 shrink-0" />
            </button>

            {isSwitcherOpen && (
              <div className="absolute left-0 mt-1.5 w-56 rounded-lg border border-white/[0.08] bg-[#090d14] shadow-lg z-50 py-1 overflow-hidden">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-neutral-500 border-b border-white/[0.04]">
                  Switch Repository
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {importedRepos.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => {
                        setActiveRepoId(repo.id);
                        setIsSwitcherOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-1.5 text-xs text-left transition-colors ${
                        repo.id === activeRepoId
                          ? 'bg-accent/5 text-accent font-medium'
                          : 'text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200'
                      }`}
                    >
                      <span className="truncate">{repo.name}</span>
                      {repo.id === activeRepoId && <Check size={11} />}
                    </button>
                  ))}
                </div>
                <div className="border-t border-white/[0.04] p-1.5">
                  <button
                    onClick={() => {
                      setIsSwitcherOpen(false);
                      setIsImportModalOpen(true);
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-md bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] py-1.5 text-[11px] text-neutral-400 font-medium transition-colors"
                  >
                    <Plus size={11} />
                    Import Repository
                  </button>
                </div>
              </div>
            )}
          </div>

          <span className="text-neutral-700 hidden sm:inline text-xs">/</span>

          <div className="relative" ref={branchSelectorRef}>
            <button
              onClick={() => setIsBranchSelectorOpen(!isBranchSelectorOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-xs text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200 transition-colors"
            >
              <GitBranch size={12} className="text-neutral-500" />
              <span>{selectedBranch}</span>
              <ChevronDown size={11} />
            </button>

            {isBranchSelectorOpen && (
              <div className="absolute left-0 mt-1.5 w-36 rounded-lg border border-white/[0.08] bg-[#090d14] shadow-lg z-50 py-1">
                <div className="px-3 py-1 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Branches</div>
                {[activeRepo.defaultBranch || 'main'].map((b) => (
                  <button
                    key={b}
                    onClick={() => { setSelectedBranch(b); setIsBranchSelectorOpen(false); }}
                    className={`flex w-full items-center justify-between px-3 py-1.5 text-xs text-left ${
                      b === selectedBranch ? 'text-accent bg-accent/5 font-semibold' : 'text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200'
                    }`}
                  >
                    <span>{b}</span>
                    {b === selectedBranch && <Check size={10} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 pl-1">
            <span className={`h-1.5 w-1.5 rounded-full ${activeRepo.isIndexed ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse-dot`} />
            <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">
              {activeRepo.isIndexed ? 'Indexed' : 'Pending'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200 transition-colors disabled:opacity-50"
          >
            {isScanning ? 'Scanning...' : 'Run scan'}
          </button>
          <button
            onClick={() => document.getElementById('ai-chat-input')?.focus()}
            className="rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200 transition-colors"
          >
            Ask AI
          </button>
          <button
            onClick={handleGenerateSummary}
            disabled={isGeneratingSummary}
            className="rounded-lg bg-accent/10 border border-accent/20 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/15 transition-colors disabled:opacity-50"
          >
            {isGeneratingSummary ? 'Generating...' : 'Generate summary'}
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <div className="space-y-5">
          <div className="rounded-lg border border-white/[0.06] bg-[#090d14] p-3">
            <div className="flex items-center justify-between mb-2.5 border-b border-white/[0.04] pb-2">
              <h2 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <FolderOpen size={12} className="text-neutral-500" />
                Files
              </h2>
              <span className="text-[10px] text-neutral-500">{files.length} files</span>
            </div>

            <div className="relative mb-3">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
              <input
                type="search"
                value={fileSearchQuery}
                onChange={(e) => setFileSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="w-full rounded-md border border-white/[0.06] bg-white/[0.02] py-1.5 pl-7 pr-2.5 text-xs text-white outline-none placeholder:text-neutral-500 focus:border-white/[0.1] transition-all"
              />
            </div>

            <div className="space-y-0.5 select-none max-h-[400px] overflow-y-auto">
              {fileTree.length > 0 ? (
                renderTree(fileSearchQuery ? filterTree(fileTree, fileSearchQuery) : fileTree)
              ) : (
                <div className="py-6 text-center">
                  {activeRepo.isIndexed ? (
                    <p className="text-[10px] text-neutral-600">No files found. Run a scan to populate the file tree.</p>
                  ) : (
                    <div>
                      <p className="text-[10px] text-neutral-600">Repository not yet scanned.</p>
                      <button onClick={handleScan} className="mt-2 text-[10px] text-accent hover:underline">
                        Run scan
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-[#090d14] p-3 space-y-2.5">
            <h3 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest pb-1.5 border-b border-white/[0.04]">
              Details
            </h3>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-500">Tech Stack</span>
                <span className="text-neutral-300 font-medium text-right truncate pl-2 max-w-[130px]">
                  {activeRepo.techStack || activeRepo.language || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-500">Files</span>
                <span className="text-neutral-300 font-medium">{activeRepo.fileCount}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-500">Dependencies</span>
                <span className="text-neutral-300 font-medium">{activeRepo.dependencyCount}</span>
              </div>
              {activeRepo.branchCount > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-500">Branches</span>
                  <span className="text-neutral-300 font-medium">{activeRepo.branchCount}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-500">Visibility</span>
                <span className="text-neutral-300 font-medium">{activeRepo.visibility}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-500">Status</span>
                <span className={`font-medium ${activeRepo.isIndexed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {activeRepo.isIndexed ? 'Indexed' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {selectedFile && selectedFileContent && (
            <div className="rounded-lg border border-white/[0.06] bg-[#090d14] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <FileCode size={13} className="text-accent" />
                  <span className="text-xs font-medium text-neutral-300">{selectedFile.path}</span>
                </div>
                <button
                  onClick={() => { setSelectedFile(null); setSelectedFileContent(null); setSelectedFileExplanation(null); }}
                  className="text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>

              {selectedFileExplanation && (
                <div className="px-4 py-2.5 bg-white/[0.01] border-b border-white/[0.04]">
                  <div className="flex items-start gap-2">
                    <Sparkles size={12} className="text-accent mt-0.5 shrink-0" />
                    <p className="text-[11px] text-neutral-400 leading-relaxed">{selectedFileExplanation}</p>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <pre className="text-[11px] text-neutral-300 p-4 font-mono leading-relaxed whitespace-pre-wrap">
                  {isLoadingFile ? (
                    <div className="flex items-center gap-2 text-neutral-500">
                      <Loader2 size={12} className="animate-spin" />
                      Loading file content...
                    </div>
                  ) : (
                    selectedFileContent
                  )}
                </pre>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-white/[0.06] bg-[#090d14] p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={12} className="text-accent" />
                AI Repository Summary
              </h2>
              {!summary && !isGeneratingSummary && (
                <button
                  onClick={handleGenerateSummary}
                  className="text-[10px] text-accent hover:underline"
                >
                  Generate
                </button>
              )}
            </div>

            <div className="rounded-md bg-white/[0.01] border border-white/[0.04] p-3.5">
              {isGeneratingSummary ? (
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Loader2 size={12} className="animate-spin" />
                  Generating AI summary...
                </div>
              ) : summary ? (
                <p className="text-sm text-neutral-300 leading-relaxed">{summary}</p>
              ) : (
                <p className="text-xs text-neutral-500">No AI summary yet. Click "Generate" to analyze this repository.</p>
              )}
            </div>

            {summary && activeRepo && (
              <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-white/[0.04] text-[11px] text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <Shield size={11} className="text-accent" />
                  {activeRepo.dependencyCount > 0 ? `${activeRepo.dependencyCount} dependencies` : 'No dependencies'}
                </span>
                <span className="flex items-center gap-1.5">
                  <GitBranch size={11} className="text-accent" />
                  {activeRepo.branchCount || 1} branch(es)
                </span>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-[#090d14] p-4">
            <h2 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-3">
              Available Analyses
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {availableAnalyses.map((a) => (
                <button
                  key={a.type}
                  onClick={() => handleRunAnalysis(a.type)}
                  className="rounded-md border border-white/[0.05] bg-white/[0.01] px-2.5 py-1.5 text-[11px] font-medium text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200 transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <a.icon size={11} />
                    {a.label}
                  </span>
                </button>
              ))}
            </div>

            {analyses.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {analyses.slice(0, 3).map((analysis) => (
                  <div
                    key={analysis.id}
                    className="rounded-md bg-white/[0.01] border border-white/[0.04] p-2.5"
                  >
                    <span className="text-[10px] font-medium text-accent uppercase tracking-wider">{analysis.type}</span>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{analysis.summary || 'Analysis completed'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-[#090d14] p-4">
            <h2 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2.5">
              Query Codebase
            </h2>

            {aiChatResponses.length > 0 && (
              <div className="space-y-3 mb-3 max-h-52 overflow-y-auto pr-1">
                {aiChatResponses.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-neutral-500 mb-0.5">
                      {msg.role === 'user' ? 'Developer' : 'Repolyx AI'}
                    </span>
                    <div
                      className={`text-xs px-3 py-2 rounded-lg max-w-[90%] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-accent/10 border border-accent/15 text-accent font-medium'
                          : 'bg-white/[0.02] border border-white/[0.04] text-neutral-300'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAiThinking && (
                  <div className="flex items-start">
                    <div className="flex items-center gap-2 text-xs text-neutral-500 bg-white/[0.02] border border-white/[0.04] px-3 py-2 rounded-lg">
                      <Loader2 size={12} className="animate-spin" />
                      Analyzing repository...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}

            <form onSubmit={handleAiChatSubmit} className="relative">
              <input
                id="ai-chat-input"
                type="text"
                value={aiChatQuery}
                onChange={(e) => setAiChatQuery(e.target.value)}
                placeholder={`Ask about ${activeRepo.name}...`}
                className="w-full rounded-md border border-white/[0.06] bg-white/[0.03] px-3 py-2 pr-9 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-white/[0.1] transition-all"
              />
              <button
                type="submit"
                disabled={isAiThinking || !aiChatQuery.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:text-accent hover:bg-white/[0.05] transition-colors disabled:opacity-30"
              >
                <ArrowRight size={13} />
              </button>
            </form>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-[#090d14] p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">
                Activity
              </h2>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {events.length > 0 ? (
                events.map((event) => {
                  const config = eventIconMap[event.type] || { icon: Info, color: 'text-neutral-500' };
                  const Icon = config.icon;
                  return (
                    <div key={event.id} className="flex items-start justify-between py-2.5 first:pt-0 last:pb-0">
                      <div className="flex gap-2.5 min-w-0 pr-3">
                        <Icon size={13} className={`${config.color} shrink-0 mt-0.5`} />
                        <div className="min-w-0">
                          <p className="text-xs text-neutral-200">{event.message}</p>
                          <p className="text-[10px] text-neutral-500 mt-0.5">{new Date(event.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="py-4 text-[10px] text-neutral-600 text-center">No activity yet. Import and scan a repository to see events.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Repository"
        maxWidth="max-w-lg"
      >
        <div className="space-y-3">
          <p className="text-xs text-neutral-400">Choose a GitHub repository to analyze with Repolyx.</p>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={repoSearchQuery}
              onChange={(e) => setRepoSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] py-1.5 pl-9 pr-3 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-accent/40 transition-all"
            />
          </div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {filteredReposToImport.map((repo) => (
              <div
                key={repo.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{repo.name}</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {repo.visibility} · {repo.language}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsImportModalOpen(false);
                    handleImportFlow(repo);
                  }}
                  className="shrink-0 rounded-md border border-white/[0.08] px-2.5 py-1 text-[11px] text-neutral-300 hover:bg-white/[0.04] hover:border-accent/30 hover:text-accent transition-colors"
                >
                  Import
                </button>
              </div>
            ))}
            {filteredReposToImport.length === 0 && (
              <p className="text-center py-5 text-xs text-neutral-500">No repositories found</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}


