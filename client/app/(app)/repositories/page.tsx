'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { mockRepos, MockRepo, MockRepoActivity } from '@/lib/repo-mock-data';

export default function RepositoryWorkspacePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [importedRepoIds, setImportedRepoIds] = useState<string[]>([]);
  const [activeRepoId, setActiveRepoId] = useState<string | null>(null);
  
  // Modal & Syncing States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [currentSyncRepoId, setCurrentSyncRepoId] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  
  // Search and selector states
  const [repoSearchQuery, setRepoSearchQuery] = useState('');
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [selectedFile, setSelectedFile] = useState<{ path: string; label: string } | null>(null);
  
  // Import setup states
  const [importSetupRepo, setImportSetupRepo] = useState<any | null>(null);
  const [importBranch, setImportBranch] = useState('');
  const [importAnalysisType, setImportAnalysisType] = useState<'quick' | 'full'>('quick');
  const [importFeatures, setImportFeatures] = useState({
    architecture: true,
    chat: true,
    docs: true,
    review: false,
  });
  
  // Interactive Suggested Actions State
  const [activeSuggestedActionResponse, setActiveSuggestedActionResponse] = useState<{ title: string; answer: string } | null>(null);
  const [aiChatQuery, setAiChatQuery] = useState('');
  const [aiChatResponses, setAiChatResponses] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);

  // Dropdown UI states
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isBranchSelectorOpen, setIsBranchSelectorOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const branchSelectorRef = useRef<HTMLDivElement>(null);

  // Collapsed states for file tree
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

  // Account selector for empty state
  const [selectedAccount, setSelectedAccount] = useState('rajesh-kayal-dev');
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  // State for fetched GitHub repos
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [isFetchingRepos, setIsFetchingRepos] = useState(false);

  // Active repository object lookup
  const activeRepo = useMemo(() => {
    if (!activeRepoId) return null;

    // 1. Search in mockRepos first
    let matched: any = mockRepos.find((r) => r.id === activeRepoId);

    // 2. If not found, search in githubRepos
    if (!matched) {
      matched = githubRepos.find((r) => r.id === activeRepoId);
    }

    if (!matched) return null;

    // 3. Fallback to templates if it's a real GitHub repository without a tree/fileTree/summary
    const lang = (matched.language || '').toLowerCase();
    const name = (matched.name || '').toLowerCase();

    let templateRepo: any = null;
    if (lang === 'typescript' || lang === 'javascript') {
      if (name.includes('api') || name.includes('server') || name.includes('backend')) {
        templateRepo = mockRepos.find(r => r.id === 'repolyx-api');
      } else if (name.includes('site') || name.includes('portfolio')) {
        templateRepo = mockRepos.find(r => r.id === 'portfolio-site');
      } else {
        templateRepo = mockRepos.find(r => r.id === 'repolyx-frontend');
      }
    } else if (lang === 'go' || lang === 'golang') {
      templateRepo = mockRepos.find(r => r.id === 'e-commerce-backend');
    } else if (lang === 'python') {
      templateRepo = mockRepos.find(r => r.id === 'ml-data-processor');
    } else {
      templateRepo = mockRepos.find(r => r.id === 'portfolio-site');
    }

    const fileTree = matched.tree || matched.fileTree || templateRepo?.tree || [];
    const suggestedActions = matched.suggestedActions || templateRepo?.suggestedActions || [];
    const activity = matched.activities || matched.activity || templateRepo?.activities || [];
    const summary = matched.summary || templateRepo?.summary || `${matched.name} is a ${matched.language || 'software'} project.`;
    const metrics = matched.metrics || templateRepo?.metrics || { files: 10, dependencies: 5, apis: 0, authFlows: 0 };
    const branches = matched.branches || (matched.defaultBranch ? [matched.defaultBranch] : ['main']);
    const stack = matched.stack || (matched.language ? `${matched.language} App` : 'Software Application');

    return {
      ...matched,
      fileTree,
      suggestedActions,
      branches,
      activity,
      metrics,
      stack,
      summary,
      description: matched.description || 'No description provided.',
      tags: matched.tags || []
    };
  }, [activeRepoId, githubRepos]);

  // 1. Mount effect: Load from localStorage
  useEffect(() => {
    setIsMounted(true);
    const storedImported = localStorage.getItem('repolyx_imported_repo_ids');
    const storedActive = localStorage.getItem('repolyx_active_repo_id');
    
    if (storedImported) {
      try {
        const parsed = JSON.parse(storedImported);
        setImportedRepoIds(parsed);
        if (storedActive && parsed.includes(storedActive)) {
          setActiveRepoId(storedActive);
        } else if (parsed.length > 0) {
          setActiveRepoId(parsed[0]);
        }
      } catch (e) {
        console.error('Error parsing stored repo IDs', e);
      }
    }
  }, []);

  // Fetch repositories from backend
  const fetchGithubRepos = async () => {
    try {
      setIsFetchingRepos(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/repositories/github`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success && data.repositories) {
        setGithubRepos(data.repositories);
        // Assuming we get importedRepositories back, we should also merge them or at least know which ones are imported
        if (data.importedRepositories && data.importedRepositories.length > 0) {
           const importedIds = data.importedRepositories.map((r: any) => r.githubRepoId);
           setImportedRepoIds(prev => Array.from(new Set([...prev, ...importedIds])));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingRepos(false);
    }
  };

  useEffect(() => {
    fetchGithubRepos();
  }, []);

  // 2. Persist to localStorage
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('repolyx_imported_repo_ids', JSON.stringify(importedRepoIds));
    if (activeRepoId) {
      localStorage.setItem('repolyx_active_repo_id', activeRepoId);
    } else {
      localStorage.removeItem('repolyx_active_repo_id');
    }
  }, [importedRepoIds, activeRepoId, isMounted]);

  // Fallback active repository selection
  useEffect(() => {
    if (!isMounted) return;
    if (importedRepoIds.length > 0 && !activeRepoId) {
      setActiveRepoId(importedRepoIds[0]);
    }
  }, [importedRepoIds, activeRepoId, isMounted]);

  // If the active repository cannot be found after fetching is complete, try to find a valid one
  useEffect(() => {
    if (!isMounted) return;
    if (!isFetchingRepos && importedRepoIds.length > 0 && !activeRepo) {
      const validId = importedRepoIds.find(id => 
        mockRepos.some(r => r.id === id) || githubRepos.some(r => r.id === id)
      );
      if (validId) {
        setActiveRepoId(validId);
      } else {
        if (mockRepos.length > 0) {
          setActiveRepoId(mockRepos[0].id);
        }
      }
    }
  }, [isFetchingRepos, importedRepoIds, activeRepo, githubRepos, isMounted]);

  // Click outside handlers for switcher & branch dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsSwitcherOpen(false);
      }
      if (branchSelectorRef.current && !branchSelectorRef.current.contains(event.target as Node)) {
        setIsBranchSelectorOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  // Reset page-level interactive sub-state when switching active repo
  useEffect(() => {
    if (activeRepo) {
      setSelectedBranch(activeRepo.branches[0] || 'main');
      setSelectedFile(null);
      setActiveSuggestedActionResponse(null);
      setAiChatResponses([]);
      setFileSearchQuery('');
    }
  }, [activeRepoId, activeRepo]);

  // 3. Automated indexing progress simulation effect
  useEffect(() => {
    if (!currentSyncRepoId) return;

    setSyncProgress(0);
    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          const repo = githubRepos.find(r => r.id === currentSyncRepoId) || mockRepos.find(r => r.id === currentSyncRepoId);
          if (repo) {
            setImportedRepoIds((prevImported) => {
              if (prevImported.includes(repo.id)) return prevImported;
              return [...prevImported, repo.id];
            });
            setGithubRepos(prevRepos =>
              prevRepos.map(r => r.id === repo.id ? { ...r, isImported: true } : r)
            );
            setActiveRepoId(repo.id);
            
            // Save to database asynchronously and handle errors
            const saveImportedRepo = async () => {
              try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/repositories/import`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ repoData: repo }),
                  credentials: 'include'
                });
                const data = await res.json();
                if (!data.success) {
                  console.error('Failed to import repository on backend:', data.message);
                }
              } catch (err) {
                console.error('Error importing repository:', err);
              }
            };
            saveImportedRepo();
          }
          setCurrentSyncRepoId(null);
          return 100;
        }
        return prev + 2.5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentSyncRepoId, githubRepos]);

  // Sync state step matching based on progress percentage
  const currentSyncStep = useMemo(() => {
    if (syncProgress < 20) return 0;
    if (syncProgress < 40) return 1;
    if (syncProgress < 60) return 2;
    if (syncProgress < 80) return 3;
    return 4;
  }, [syncProgress]);

  // Filtered repositories for import list
  const filteredReposToImport = useMemo(() => {
    return githubRepos.filter((repo) =>
      !repo.isImported && 
      (repo.name.toLowerCase().includes(repoSearchQuery.toLowerCase()) ||
      repo.stack.toLowerCase().includes(repoSearchQuery.toLowerCase()) ||
      repo.language.toLowerCase().includes(repoSearchQuery.toLowerCase()))
    );
  }, [repoSearchQuery, githubRepos]);

  // Handle trigger for simulated import
  const startImportFlow = (repoId: string) => {
    setCurrentSyncRepoId(repoId);
  };

  // Open import setup modal with repo details
  const handleImportClick = (repo: any) => {
    setImportSetupRepo(repo);
    setImportBranch(repo.defaultBranch || 'main');
    setImportAnalysisType('quick');
    setImportFeatures({ architecture: true, chat: true, docs: true, review: false });
  };

  // Start analysis from setup modal
  const handleStartAnalysis = () => {
    if (!importSetupRepo) return;
    setImportSetupRepo(null);
    startImportFlow(importSetupRepo.id);
  };

  const toggleImportFeature = (key: keyof typeof importFeatures) => {
    setImportFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Toggle folder expansion state
  const toggleFolder = (folderName: string) => {
    setCollapsedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  // Submit mock AI queries inside Workspace
  const handleAiChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatQuery.trim() || !activeRepo) return;

    const userMsg = aiChatQuery.trim();
    setAiChatResponses(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiChatQuery('');

    setTimeout(() => {
      let reply = `I have analyzed your query regarding "${userMsg}" in the context of the **${activeRepo.name}** repository.`;
      
      const lower = userMsg.toLowerCase();
      if (lower.includes('auth') || lower.includes('login') || lower.includes('oauth')) {
        const authAction = activeRepo.suggestedActions.find((a: any) => a.title.toLowerCase().includes('auth'));
        reply = authAction 
          ? authAction.answer 
          : `This repository has minimal user authentication bindings mapped. Main application flows are structured around general file processing layouts.`;
      } else if (lower.includes('depend') || lower.includes('package') || lower.includes('version')) {
        const depAction = activeRepo.suggestedActions.find((a: any) => a.title.toLowerCase().includes('depend') || a.title.toLowerCase().includes('package'));
        reply = depAction 
          ? depAction.answer 
          : `The repository dependencies configuration details are specified in package manifests. Build sequences rely on standard language runtime dependencies without critical vulnerabilities.`;
      } else if (lower.includes('performance') || lower.includes('rendering') || lower.includes('speed') || lower.includes('slow')) {
        const perfAction = activeRepo.suggestedActions.find((a: any) => a.title.toLowerCase().includes('perform') || a.title.toLowerCase().includes('render'));
        reply = perfAction 
          ? perfAction.answer 
          : `Rendering boundaries are stable. Standard React component structures are utilized with component-scoped states to prevent page-wide repaint cycles.`;
      } else {
        reply = `I've inspected the file mappings. The repository utilizes a **${activeRepo.stack}** architecture with ${activeRepo.metrics.files} files. Specific functions are isolated under structural subfolders inside the core codebase.`;
      }

      setAiChatResponses(prev => [...prev, { role: 'assistant', text: reply }]);
    }, 800);
  };

  // Render checkmark icon config for activity
  const renderActivityIcon = (type: string) => {
    const iconSize = 14;
    switch (type) {
      case 'scan':
        return <CheckCircle2 size={iconSize} className="text-emerald-400 shrink-0 mt-0.5" />;
      case 'commit':
        return <GitCommit size={iconSize} className="text-sky-400 shrink-0 mt-0.5" />;
      case 'alert':
        return <AlertTriangle size={iconSize} className="text-amber-400 shrink-0 mt-0.5" />;
      case 'deploy':
        return <RefreshCw size={iconSize} className="text-teal-400 shrink-0 mt-0.5" />;
      case 'info':
      default:
        return <Info size={iconSize} className="text-neutral-500 shrink-0 mt-0.5" />;
    }
  };

  // Safe Mount Rendering guard
  if (!isMounted) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-neutral-500" />
      </div>
    );
  }

  // --- STATE 3: Repository Sync Screen ---
  if (currentSyncRepoId) {
    const repoSyncing = mockRepos.find((r) => r.id === currentSyncRepoId) || githubRepos.find((r) => r.id === currentSyncRepoId);
    const stepLabels = [
      'Connecting repository...',
      'Scanning folders...',
      'Reading dependencies...',
      'Indexing files...',
      'Preparing AI workspace...'
    ];

    return (
      <div className="max-w-lg mx-auto py-16 px-4">
        <div className="rounded-xl border border-white/[0.06] bg-[#090d14] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
              <Github size={16} className="text-neutral-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Importing repository</h2>
              <p className="text-xs text-neutral-500 mt-0.5">{repoSyncing?.name}</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {stepLabels.map((step, idx) => {
              const isCompleted = idx < currentSyncStep;
              const isActive = idx === currentSyncStep;

              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {isCompleted && (
                      <Check size={12} className="text-emerald-400" />
                    )}
                    {isActive && (
                      <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    )}
                    {!isCompleted && !isActive && (
                      <div className="h-2 w-2 rounded-full bg-neutral-800" />
                    )}
                  </div>
                  <span className={`text-xs ${
                    isCompleted ? 'text-neutral-400' :
                    isActive ? 'text-white font-medium' : 'text-neutral-600'
                  }`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-neutral-500">
              <span>Progress</span>
              <span>{Math.round(syncProgress)}%</span>
            </div>
            <div className="w-full bg-neutral-900 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-accent h-1 transition-all duration-100 ease-out" 
                style={{ width: `${syncProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- STATE 1: Empty Repository State ---
  if (importedRepoIds.length === 0) {
    const accounts = [
      { id: 'rajesh-kayal-dev', label: 'rajesh-kayal-dev', icon: '👤', type: 'account' },
      { id: 'jublii-in', label: 'jublii-in', icon: '🏢', type: 'account' },
    ];

    return (
      <div className="py-8 px-1">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Left Column: Repository Import */}
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Github size={18} className="text-neutral-400" />
                  <h1 className="text-base font-semibold text-white">Import Repository</h1>
                </div>
              </div>
            </div>

            {/* Account selector + Search row */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#090d14] px-3 py-1.5 text-xs text-neutral-300 hover:border-white/[0.12] transition-colors"
                >
                  <span>{accounts.find(a => a.id === selectedAccount)?.icon}</span>
                  <span className="font-medium">{accounts.find(a => a.id === selectedAccount)?.label}</span>
                  <ChevronDown size={12} className="text-neutral-500" />
                </button>
                {isAccountOpen && (
                  <div className="absolute left-0 mt-1 w-52 rounded-lg border border-white/[0.08] bg-[#090d14] shadow-lg z-50 py-1">
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Accounts</div>
                    {accounts.map(acc => (
                      <button
                        key={acc.id}
                        onClick={() => { setSelectedAccount(acc.id); setIsAccountOpen(false); }}
                        className={`flex w-full items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors ${
                          acc.id === selectedAccount
                            ? 'text-accent bg-accent/5'
                            : 'text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200'
                        }`}
                      >
                        <span>{acc.icon}</span>
                        <span>{acc.label}</span>
                      </button>
                    ))}
                    <div className="border-t border-white/[0.04] mt-1 pt-1">
                      <div className="px-3 py-1.5 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Actions</div>
                      <button className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200 transition-colors">
                        <Plus size={12} />
                        <span>Add GitHub Account</span>
                      </button>
                      <button className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200 transition-colors">
                        <span className="text-[11px]">⇄</span>
                        <span>Switch Provider</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

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

            {/* Repository List */}
            <div className="rounded-lg border border-white/[0.06] divide-y divide-white/[0.03] max-h-[580px] overflow-y-auto">
              {filteredReposToImport.map((repo) => (
                <div
                  key={repo.id}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.015] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">{repo.name}</span>
                      <span className={`shrink-0 text-[10px] leading-none px-1.5 py-0.5 rounded-sm border ${
                        repo.visibility === 'Public' 
                          ? 'border-emerald-500/15 text-emerald-400/80'
                          : 'border-amber-500/15 text-amber-400/80'
                      }`}>
                        {repo.visibility}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 mt-0.5 text-[11px] text-neutral-500">
                      <span>{repo.language}</span>
                      <span className="w-0.5 h-0.5 rounded-full bg-neutral-600" />
                      <span>{repo.stack.split('·')[0].trim()}</span>
                      <span className="w-0.5 h-0.5 rounded-full bg-neutral-600" />
                      <span className="text-neutral-600">Updated {repo.lastUpdated}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleImportClick(repo)}
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

          {/* Right Column: Onboarding Guide */}
          <div className="space-y-4">
            {/* Getting Started */}
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

            {/* AI Features */}
            <div className="rounded-lg border border-white/[0.06] bg-[#090d14] px-3.5 py-3">
              <h3 className="text-[11px] font-semibold text-neutral-300 mb-2.5">Features</h3>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {[
                  'Architecture Map',
                  'Dependency Graph',
                  'Auto Docs',
                  'Code Search',
                  'Security Scan',
                  'PR Review',
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-accent/60" />
                    <span className="text-[10px] text-neutral-500">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <div className="rounded-lg border border-white/[0.06] bg-[#090d14] px-3.5 py-3">
              <h3 className="text-[11px] font-semibold text-neutral-300 mb-1.5">How It Works</h3>
              <p className="text-[10px] text-neutral-500 leading-relaxed">
                Connects to your repositories and runs analysis to map code structure, dependencies, APIs, and security patterns into an interactive workspace.
              </p>
            </div>
          </div>
        </div>

        {/* Import Setup Modal */}
        <AnimatePresence>
          {importSetupRepo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
              onClick={() => setImportSetupRepo(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[520px] mx-4 rounded-lg border border-white/[0.08] bg-[#0a0e14] shadow-lg"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Import Repository</h2>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Prepare this repository for AI indexing and analysis.
                    </p>
                  </div>
                  <button
                    onClick={() => setImportSetupRepo(null)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 hover:bg-white/[0.05] hover:text-neutral-300 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Repository Preview */}
                <div className="px-5 py-3 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2.5">
                    <Github size={14} className="text-neutral-400 shrink-0" />
                    <div>
                      <p className="text-[13px] font-medium text-white">{importSetupRepo.name}</p>
                      <p className="text-[11px] text-neutral-500">
                        github.com/{importSetupRepo.name} · {importSetupRepo.visibility} repository
                      </p>
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <div className="px-5 py-4 space-y-4">
                  {/* Branch */}
                  <div>
                    <label className="text-[11px] font-medium text-neutral-400 mb-1.5 block">Branch</label>
                    <div className="relative inline-block">
                      <select
                        value={importBranch}
                        onChange={(e) => setImportBranch(e.target.value)}
                        className="appearance-none rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 pr-8 text-xs text-neutral-300 outline-none focus:border-accent/40 transition-colors cursor-pointer"
                      >
                        {(importSetupRepo.branches || [importSetupRepo.defaultBranch || 'main']).map((b: string) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                      <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                    </div>
                  </div>

                  {/* Analysis Type */}
                  <div>
                    <label className="text-[11px] font-medium text-neutral-400 mb-2 block">Analysis Type</label>
                    <div className="flex gap-3">
                      {[
                        { value: 'quick' as const, label: 'Quick Scan', desc: 'Index structure and key files' },
                        { value: 'full' as const, label: 'Full Analysis', desc: 'Deep scan all files and dependencies' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setImportAnalysisType(opt.value)}
                          className={`flex-1 rounded-md border px-3 py-2 text-left transition-colors ${
                            importAnalysisType === opt.value
                              ? 'border-accent/30 bg-accent/5'
                              : 'border-white/[0.06] hover:border-white/[0.1]'
                          }`}
                        >
                          <p className="text-[11px] font-medium text-neutral-300">{opt.label}</p>
                          <p className="text-[10px] text-neutral-500 mt-0.5">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <label className="text-[11px] font-medium text-neutral-400 mb-2 block">Features</label>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {[
                        { key: 'architecture' as const, label: 'Architecture Mapping' },
                        { key: 'chat' as const, label: 'AI Chat' },
                        { key: 'docs' as const, label: 'Documentation' },
                        { key: 'review' as const, label: 'Pull Request Review' },
                      ].map((feat) => (
                        <label
                          key={feat.key}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <div
                            onClick={() => toggleImportFeature(feat.key)}
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                              importFeatures[feat.key]
                                ? 'bg-accent border-accent'
                                : 'border-white/[0.12] group-hover:border-white/[0.2]'
                            }`}
                          >
                            {importFeatures[feat.key] && (
                              <Check size={10} className="text-black" />
                            )}
                          </div>
                          <span className="text-[11px] text-neutral-400 select-none">{feat.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-white/[0.05]">
                  <button
                    onClick={() => setImportSetupRepo(null)}
                    className="rounded-md border border-white/[0.08] px-3.5 py-1.5 text-xs text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartAnalysis}
                    className="rounded-md bg-accent px-3.5 py-1.5 text-xs font-medium text-black hover:bg-accent/90 transition-colors"
                  >
                    Start Analysis
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // --- STATE 3.5: Loading Workspace details ---
  if (isFetchingRepos && importedRepoIds.length > 0 && !activeRepo) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
        <span className="text-xs text-neutral-500 font-mono tracking-wider">LOADING REPOSITORY WORKSPACE...</span>
      </div>
    );
  }

  // --- STATE 4: Repository Workspace (Only renders if activeRepo is found) ---
  if (!activeRepo) return null;

  // Filtered file explorer list
  const filteredTree = (activeRepo.fileTree || []).map((section: any) => {
    return {
      ...section,
      items: (section.items || []).filter((item: any) =>
        (item.name || item.label || '').toLowerCase().includes(fileSearchQuery.toLowerCase())
      ),
    };
  }).filter((section: any) => section.items.length > 0);

  return (
    <div className="space-y-5">
      {/* Workspace Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-white/[0.04] pb-4">
        
        {/* Switcher & branch Selector Left Group */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Dropdown Repository Switcher */}
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
                  Switch Workspace
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {importedRepoIds.map((id) => {
                    const repoObj = mockRepos.find((r) => r.id === id) || githubRepos.find((r) => r.id === id);
                    if (!repoObj) {
                      return (
                        <div key={id} className="flex w-full items-center justify-between px-3 py-1.5 text-xs text-neutral-500">
                          <span className="truncate">Loading {id}...</span>
                        </div>
                      );
                    }
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          setActiveRepoId(id);
                          setIsSwitcherOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-3 py-1.5 text-xs text-left transition-colors ${
                          id === activeRepoId
                            ? 'bg-accent/5 text-accent font-medium'
                            : 'text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200'
                        }`}
                      >
                        <span className="truncate">{repoObj.name}</span>
                        {id === activeRepoId && <Check size={11} />}
                      </button>
                    );
                  })}
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

          {/* Branch selector dropdown */}
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
                <div className="px-3 py-1 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Branches
                </div>
                {activeRepo.branches.map((b: string) => (
                  <button
                    key={b}
                    onClick={() => {
                      setSelectedBranch(b);
                      setIsBranchSelectorOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-1.5 text-xs text-left ${
                      b === selectedBranch
                        ? 'text-accent bg-accent/5 font-semibold'
                        : 'text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200'
                    }`}
                  >
                    <span>{b}</span>
                    {b === selectedBranch && <Check size={10} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Index Status Badge */}
          <div className="flex items-center gap-1.5 pl-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
            <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">Indexed</span>
          </div>
        </div>

        {/* Action Buttons Right Group */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveSuggestedActionResponse({
                title: 'Full Repository Deep-Scan',
                answer: `Re-indexing completed. Evaluated ${activeRepo.metrics.files} files and dependencies inside \`${selectedBranch}\` branch. Environment is healthy with 0 critical security patches required.`
              });
            }}
            className="rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200 transition-colors"
          >
            Run analysis
          </button>
          <button
            onClick={() => {
              const element = document.getElementById('ai-chat-input-box');
              element?.focus();
            }}
            className="rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200 transition-colors"
          >
            Ask AI
          </button>
          <button
            onClick={() => {
              setActiveSuggestedActionResponse({
                title: 'Generate API & Workspace Docs',
                answer: `Auto-generated Markdown documentation for **${activeRepo.name}**. Stack metadata mapped: ${activeRepo.stack}. Module details written to AI workspace environment schema config files.`
              });
            }}
            className="rounded-lg bg-accent/10 border border-accent/20 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/15 transition-colors"
          >
            Generate docs
          </button>
        </div>
      </div>

      {/* Main 2-column workspace */}
      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        
        {/* Left Side: Navigation */}
        <div className="space-y-5">
          
          {/* File Explorer Panel */}
          <div className="rounded-lg border border-white/[0.06] bg-[#090d14] p-3">
            <div className="flex items-center justify-between mb-2.5 border-b border-white/[0.04] pb-2">
              <h2 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <FolderOpen size={12} className="text-neutral-500" />
                Files
              </h2>
              <span className="text-[10px] text-neutral-500">{activeRepo.metrics.files} files</span>
            </div>

            {/* File Search */}
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

            {/* Files List Tree */}
            <div className="space-y-0.5 select-none">
              {activeRepo.fileTree?.map((section: any) => (
                <div key={section.section} className="mb-4">
                  <button
                    onClick={() => toggleFolder(section.section)}
                    className="flex items-center gap-1.5 w-full text-left px-2 py-1 hover:bg-white/[0.04] rounded transition-colors group"
                  >
                    <ChevronRight size={12} className={`text-neutral-500 transition-transform ${collapsedFolders[section.section] ? '' : 'rotate-90'}`} />
                    <Folder size={12} className="text-accent/70" />
                    <span className="text-[11px] font-medium text-neutral-300 uppercase tracking-wider">{section.section}</span>
                  </button>
                  
                  {!collapsedFolders[section.section] && (
                    <div className="mt-1 ml-4 border-l border-white/[0.05] pl-2 space-y-0.5">
                      {section.items.filter((item: any) => item.name.toLowerCase().includes(fileSearchQuery.toLowerCase())).map((item: any) => {
                        const isActive = selectedFile?.path === item.path;
                        return (
                          <button
                            key={item.path}
                            type="button"
                            onClick={() => {
                              setSelectedFile({ path: item.path, label: item.name });
                              setActiveSuggestedActionResponse({
                                title: `File Analysis: ${item.name}`,
                                answer: `Inspected source file \`${item.path}\` in ${activeRepo.name}.\n\nThis file implements critical components for the **${activeRepo.stack.split('·')[0]}** module structure.`
                              });
                            }}
                            className={`flex w-full items-center gap-2 rounded px-2 py-1 text-[11px] text-left transition-colors ${
                              isActive
                                ? 'bg-accent/5 text-accent font-medium'
                                : 'text-neutral-400 hover:bg-white/[0.02] hover:text-neutral-200'
                            }`}
                          >
                            <FileCode size={11} className={isActive ? 'text-accent' : 'text-neutral-600'} />
                            <span className="truncate flex-1">{item.name}</span>
                            {item.tag && (
                              <span className={`shrink-0 text-[9px] font-medium px-1 py-0.5 rounded ${
                                item.tag === 'AI' 
                                  ? 'bg-accent/10 text-accent border border-accent/15' 
                                  : 'bg-white/5 text-neutral-500 border border-white/5'
                              }`}>
                                {item.tag}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {(!activeRepo.fileTree || activeRepo.fileTree.length === 0) && (
                <p className="text-center py-4 text-[10px] text-neutral-600">No matching files</p>
              )}
            </div>
          </div>

          {/* Repo Mini-Summary */}
          <div className="rounded-lg border border-white/[0.06] bg-[#090d14] p-3 space-y-2.5">
            <h3 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest pb-1.5 border-b border-white/[0.04]">
              Details
            </h3>
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-500">Tech Stack</span>
                <span className="text-neutral-300 font-medium text-right truncate pl-2 max-w-[130px]">{activeRepo.stack.split('·')[0]}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-500">Dependencies</span>
                <span className="text-neutral-300 font-medium">{activeRepo.metrics.dependencies} items</span>
              </div>
              {activeRepo.metrics.apis > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-500">Endpoints</span>
                  <span className="text-neutral-300 font-medium">{activeRepo.metrics.apis} mapped</span>
                </div>
              )}
              {activeRepo.metrics.authFlows > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-500">Auth Flows</span>
                  <span className="text-neutral-300 font-medium">{activeRepo.metrics.authFlows} tracked</span>
                </div>
              )}
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-500">Visibility</span>
                <span className="text-neutral-300 font-medium">{activeRepo.visibility}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-500">Last Sync</span>
                <span className="text-neutral-300 font-medium">{activeRepo.lastUpdated}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Primary Content Panel */}
        <div className="space-y-5">

          {/* SECTION 1: AI Repository Summary */}
          <div className="rounded-lg border border-white/[0.06] bg-[#090d14] p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={12} className="text-accent" />
                AI Repository Summary
              </h2>
            </div>
            
            <div className="rounded-md bg-white/[0.01] border border-white/[0.04] p-3.5">
              <p className="text-sm text-neutral-300 leading-relaxed">
                {activeRepo.summary}
              </p>
              
              <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-white/[0.04] text-[11px] text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <Shield size={11} className="text-accent" />
                  {activeRepo.metrics.authFlows > 0 ? 'Auth protocols mapped' : 'No custom auth routes'}
                </span>
                <span className="flex items-center gap-1.5">
                  <GitBranch size={11} className="text-accent" />
                  {activeRepo.branches.length} branches indexed
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: Suggested Actions */}
          <div className="rounded-lg border border-white/[0.06] bg-[#090d14] p-4">
            <h2 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-3">
              Suggested Actions
            </h2>
            
            <div className="flex flex-wrap gap-1.5 mb-3">
              {activeRepo.suggestedActions?.map((action: any, idx: number) => {
                const isActive = activeSuggestedActionResponse?.title === action.title;
                return (
                  <button
                    key={action.title}
                    onClick={() => setActiveSuggestedActionResponse(
                      isActive ? null : { title: action.title, answer: action.answer }
                    )}
                    className={`rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-all text-left ${
                      isActive
                        ? 'border-accent/30 bg-accent/5 text-accent'
                        : 'border-white/[0.05] bg-white/[0.01] text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200'
                    }`}
                  >
                    {action.title}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {activeSuggestedActionResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-md border border-white/[0.06] bg-[#0b1019] p-3.5 relative"
                >
                  <button
                    onClick={() => setActiveSuggestedActionResponse(null)}
                    className="absolute top-2.5 right-2.5 text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    <X size={12} />
                  </button>
                  <h4 className="text-[11px] font-semibold text-accent uppercase tracking-wider mb-1.5">
                    {activeSuggestedActionResponse.title}
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line pr-5">
                    {activeSuggestedActionResponse.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Chat */}
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
                    <div className={`text-xs px-3 py-2 rounded-lg max-w-[90%] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-accent/10 border border-accent/15 text-accent font-medium'
                        : 'bg-white/[0.02] border border-white/[0.04] text-neutral-300'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAiChatSubmit} className="relative">
              <input
                id="ai-chat-input-box"
                type="text"
                value={aiChatQuery}
                onChange={(e) => setAiChatQuery(e.target.value)}
                placeholder={`Ask about ${activeRepo.name}...`}
                className="w-full rounded-md border border-white/[0.06] bg-white/[0.03] px-3 py-2 pr-9 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-white/[0.1] transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:text-accent hover:bg-white/[0.05] transition-colors"
              >
                <ArrowRight size={13} />
              </button>
            </form>
          </div>

          {/* SECTION 3: Recent Activity Timeline */}
          <div className="rounded-lg border border-white/[0.06] bg-[#090d14] p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">
                Recent Activity
              </h2>
            </div>
            
            <div className="divide-y divide-white/[0.04]">
              {activeRepo.activity?.map((activity: any, i: number) => (
                <div
                  key={i}
                  className="flex items-start justify-between py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="flex gap-2.5 min-w-0 pr-3">
                    {renderActivityIcon(activity.type)}
                    <div className="min-w-0">
                      <p className="text-xs text-neutral-200">{activity.title}</p>
                      <p className="text-[10px] text-neutral-500 truncate mt-0.5">{activity.detail}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] text-neutral-500 mt-0.5">{activity.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Import Dialog Modal (Accessible from Switcher) */}
      <Modal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)}
        title="Import Repository"
        maxWidth="max-w-lg"
      >
        <div className="space-y-3">
          <p className="text-xs text-neutral-400">
            Choose a GitHub repository to analyze with Repolyx.
          </p>

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
                    {repo.visibility} • {repo.language} • Updated {repo.lastUpdated}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsImportModalOpen(false);
                    startImportFlow(repo.id);
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
