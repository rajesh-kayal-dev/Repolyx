'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Github,
  GitBranch,
  Loader2,
  Info,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  FolderOpen,
  BookOpen,
  Zap,
  Shield,
  ArrowLeft,
  FileCode,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { FileTree } from '@/components/repository/FileTree';
import { CodeViewer } from '@/components/repository/CodeViewer';
import { BranchSelector } from '@/components/repository/BranchSelector';
import { CodeButton } from '@/components/repository/CodeButton';
import { FileFinder } from '@/components/repository/FileFinder';
import type { Repository, RepositoryFile, RepositoryEvent, TreeNode, ChatMessage } from '@/lib/types';

export default function RepositoryWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const repositoryId = params?.repositoryId as string;

  const [repo, setRepo] = useState<Repository | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fileTree, setFileTree] = useState<TreeNode[]>([]);
  const [files, setFiles] = useState<RepositoryFile[]>([]);
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [selectedFile, setSelectedFile] = useState<RepositoryFile | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [selectedFileExplanation, setSelectedFileExplanation] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  const [selectedBranch, setSelectedBranch] = useState('main');
  const [isBranchSelectorOpen, setIsBranchSelectorOpen] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [defaultBranch, setDefaultBranch] = useState('main');
  const branchSelectorRef = useRef<HTMLDivElement>(null);

  const [summary, setSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const [events, setEvents] = useState<RepositoryEvent[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);

  const [aiChatQuery, setAiChatQuery] = useState('');
  const [aiChatResponses, setAiChatResponses] = useState<ChatMessage[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!repositoryId) return;
    loadRepository(repositoryId);
  }, [repositoryId]);

  const loadRepository = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.repositories.get(id);
      const repoData = res.repository;
      setRepo(repoData);
      setSummary(repoData.aiSummary);
      const defaultB = repoData.defaultBranch || 'main';
      setSelectedBranch(defaultB);
      setDefaultBranch(defaultB);
      setEvents(repoData.events || []);
      setAnalyses(repoData.analyses || []);
      setSelectedFile(null);
      setSelectedFileContent(null);
      setSelectedFileExplanation(null);
      setAiChatResponses([]);
      if (repoData.isIndexed) {
        loadFileTree(id);
        loadBranches(id);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load repository');
    } finally {
      setIsLoading(false);
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

  const loadBranches = async (id: string) => {
    try {
      const res = await api.repositories.getBranches(id);
      setBranches(res.branches || []);
      if (res.defaultBranch) setDefaultBranch(res.defaultBranch);
    } catch {
      setBranches([]);
    }
  };

  const handleSwitchBranch = async (branch: string) => {
    if (!repo || branch === selectedBranch) return;
    setSelectedBranch(branch);
    setSelectedFile(null);
    setSelectedFileContent(null);
    setSelectedFileExplanation(null);
    setIsLoadingFile(false);
    setIsScanning(true);
    try {
      await api.repositories.scan(repo.id, branch);
      await loadFileTree(repo.id);
      const res = await api.repositories.get(repo.id);
      if (res.repository) setRepo(res.repository);
    } catch (e: any) {
      console.error('Branch switch failed:', e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleScan = async () => {
    if (!repo || isScanning) return;
    try {
      setIsScanning(true);
      await api.repositories.scan(repo.id, selectedBranch);
      await loadRepository(repo.id);
    } catch (e: any) {
      console.error('Scan failed:', e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!repo || isGeneratingSummary) return;
    try {
      setIsGeneratingSummary(true);
      const res = await api.repositories.generateSummary(repo.id);
      setSummary(res.summary);
    } catch (e: any) {
      console.error('Failed to generate summary:', e);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleRunAnalysis = async (type: string) => {
    if (!repo) return;
    try {
      const res = await api.repositories.analyze(repo.id, type);
      setAnalyses((prev) => [res.analysis, ...prev]);
      loadEvents(repo.id);
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
    if (!repo) return;
    setSelectedFile(file);
    setIsLoadingFile(true);
    try {
      const res = await api.repositories.getFile(repo.id, file.id, selectedBranch);
      const fileData = res.file;
      setSelectedFileContent(fileData.content || null);
      setSelectedFileExplanation(fileData.explanation || null);
    } catch (e: any) {
      setSelectedFileContent(null);
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleAiChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatQuery.trim() || !repo || isAiThinking) return;
    const query = aiChatQuery.trim();
    setAiChatResponses((prev) => [...prev, { role: 'user', text: query }]);
    setAiChatQuery('');
    setIsAiThinking(true);
    try {
      const res = await api.repositories.query(repo.id, query, selectedFile?.path, selectedBranch);
      setAiChatResponses((prev) => [...prev, { role: 'assistant', text: res.answer }]);
    } catch (e: any) {
      setAiChatResponses((prev) => [...prev, { role: 'assistant', text: `Error: ${e.message || 'Failed to get response'}` }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChatResponses]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (branchSelectorRef.current && !branchSelectorRef.current.contains(event.target as Node)) {
        setIsBranchSelectorOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
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
        <h2 className="text-sm font-semibold text-white mb-1">Repository not found</h2>
        <p className="text-xs text-neutral-500 mb-4">{error}</p>
        <button
          onClick={() => router.push('/repositories')}
          className="rounded-md border border-white/[0.06] px-3 py-1.5 text-xs text-neutral-400 hover:bg-white/[0.03] transition-colors"
        >
          Back to repositories
        </button>
      </div>
    );
  }

  if (!repo) return null;

  const eventIconMap: Record<string, any> = {
    imported: { icon: Github, color: 'text-sky-400' },
    indexed: { icon: CheckCircle2, color: 'text-emerald-400' },
    analyzed: { icon: SearchIcon, color: 'text-purple-400' },
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
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-white/[0.04] pb-3 mb-4 shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => router.push('/repositories')}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-2.5 py-1.5 text-xs text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200 transition-colors"
          >
            <ArrowLeft size={13} />
            Back
          </button>
          <span className="text-neutral-700 text-xs">/</span>
          <div className="flex items-center gap-2">
            <Github size={14} className="text-neutral-400" />
            <span className="text-sm font-medium text-white">{repo.name}</span>
          </div>
          <span className="text-neutral-700 text-xs">/</span>
          <div ref={branchSelectorRef}>
            <BranchSelector
              branches={branches}
              selectedBranch={selectedBranch}
              defaultBranch={defaultBranch}
              onSelectBranch={handleSwitchBranch}
              isOpen={isBranchSelectorOpen}
              onToggle={() => setIsBranchSelectorOpen(!isBranchSelectorOpen)}
            />
          </div>
          <div className="flex items-center gap-1.5 pl-1">
            <span className={`h-1.5 w-1.5 rounded-full ${repo.isIndexed ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse-dot`} />
            <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">
              {repo.isIndexed ? 'Indexed' : 'Pending'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FileFinder
            tree={fileTree}
            files={files}
            onFileSelect={handleFileClick}
          />
          <CodeButton
            cloneUrl={repo.cloneUrl}
            fullName={repo.fullName}
            selectedBranch={selectedBranch}
            fileCount={repo.fileCount}
            dependencyCount={repo.dependencyCount}
            techStack={repo.techStack}
            repoDescription={repo.description}
            branchCount={repo.branchCount}
          />
          <button onClick={handleScan} disabled={isScanning}
            className="rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200 transition-colors disabled:opacity-50"
          >
            {isScanning ? 'Scanning...' : 'Scan'}
          </button>
          <button onClick={handleGenerateSummary} disabled={isGeneratingSummary}
            className="rounded-lg bg-accent/10 border border-accent/20 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/15 transition-colors disabled:opacity-50"
          >
            {isGeneratingSummary ? 'Generating...' : 'Analyze'}
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[280px_1fr] min-h-0 flex-1">
        <div className="space-y-4">
          <FileTree
            tree={fileTree}
            files={files}
            selectedFile={selectedFile}
            onFileSelect={handleFileClick}
            collapsedFolders={collapsedFolders}
            onToggleFolder={(path) => setCollapsedFolders((prev) => ({ ...prev, [path]: !prev[path] }))}
            fileSearchQuery={fileSearchQuery}
            onSearchChange={setFileSearchQuery}
            onScanClick={handleScan}
            isIndexed={repo.isIndexed}
          />
          <div className="rounded-lg border border-white/[0.06] bg-[#090d14] p-3 space-y-2.5">
            <h3 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest pb-1.5 border-b border-white/[0.04]">
              Details
            </h3>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-500">Tech Stack</span>
                <span className="text-neutral-300 font-medium text-right truncate pl-2 max-w-[130px]">
                  {repo.techStack || repo.language || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-500">Files</span>
                <span className="text-neutral-300 font-medium">{repo.fileCount}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-500">Dependencies</span>
                <span className="text-neutral-300 font-medium">{repo.dependencyCount}</span>
              </div>
              {repo.branchCount > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-500">Branches</span>
                  <span className="text-neutral-300 font-medium">{repo.branchCount}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-500">Visibility</span>
                <span className="text-neutral-300 font-medium">{repo.visibility}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-500">Status</span>
                <span className={`font-medium ${repo.isIndexed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {repo.isIndexed ? 'Indexed' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 min-w-0">
          {selectedFile && (
            <CodeViewer
              file={selectedFile}
              content={selectedFileContent}
              explanation={selectedFileExplanation}
              isLoading={isLoadingFile}
            />
          )}

          <div className="lg:grid lg:grid-cols-2 lg:gap-5 space-y-5 lg:space-y-0">
            <div className="space-y-5">
              <div className="rounded-lg border border-white/[0.06] bg-[#090d14] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles size={12} className="text-accent" />
                    AI Repository Summary
                  </h2>
                  {!summary && !isGeneratingSummary && (
                    <button onClick={handleGenerateSummary} className="text-[10px] text-accent hover:underline">Generate</button>
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
                    <p className="text-xs text-neutral-500">No AI summary yet. Click "Analyze" to generate one.</p>
                  )}
                </div>
                {summary && (
                  <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-white/[0.04] text-[11px] text-neutral-500">
                    <span className="flex items-center gap-1.5">
                      <Shield size={11} className="text-accent" />
                      {repo.dependencyCount > 0 ? `${repo.dependencyCount} dependencies` : 'No dependencies'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <GitBranch size={11} className="text-accent" />
                      {repo.branchCount || 1} branch(es)
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
                      <div key={analysis.id} className="rounded-md bg-white/[0.01] border border-white/[0.04] p-2.5">
                        <span className="text-[10px] font-medium text-accent uppercase tracking-wider">{analysis.type}</span>
                        <p className="text-[11px] text-neutral-400 mt-0.5">{analysis.summary || 'Analysis completed'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5">
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
                    placeholder={`Ask about ${repo.name}...`}
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
                  <h2 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">Activity</h2>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {events.length > 0 ? (
                    events.map((event) => {
                      const config = eventIconMap[event.type] || { icon: Info, color: 'text-neutral-500' };
                      const Icon = config.icon;
                      return (
                        <div key={event.id} className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0">
                          <Icon size={13} className={`${config.color} shrink-0 mt-0.5`} />
                          <div className="min-w-0">
                            <p className="text-xs text-neutral-200">{event.message}</p>
                            <p className="text-[10px] text-neutral-500 mt-0.5">{new Date(event.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="py-4 text-[10px] text-neutral-600 text-center">
                      No activity yet. Import and scan a repository to see events.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchIcon(props: any) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
