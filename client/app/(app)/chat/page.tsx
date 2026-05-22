'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  MessageSquare,
  Plus,
  Trash2,
  Loader2,
  FileText,
  GitBranch,
  ChevronDown,
  Search,
  Sparkles,
  Check,
  ArrowRight,
  Code,
  FolderOpen,
  ScanSearch,
  File,
  Brain,
  ExternalLink
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useImportRepo } from '@/lib/import-repo-context';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { highlightCode } from '@/lib/code-highlighter';
import { showToast } from '@/lib/use-toast';

const FILE_EXT_PATTERN = /^[.\w\-/]+\.[a-z]{1,4}$/i;
const KNOWN_EXTS = ['js','ts','jsx','tsx','py','go','rs','java','rb','php','c','cpp','cs','swift','kt','scala','r','mjs','cjs','json','yml','yaml','toml','xml','md','css','scss','sass','less','html','htm','sql','graphql','gql','prisma','env','sh','bash','zsh','ps1','bat','dockerfile','gitignore','editorconfig','vue','svelte','astro','sol','wasm'];

function isFilePath(text: string): boolean {
  const hasSep = text.includes('/') || text.includes('\\');
  const hasExt = KNOWN_EXTS.some(ext => text.endsWith(`.${ext}`));
  return (hasSep || text.startsWith('.')) && hasExt;
}

export default function ChatWorkspacePage() {
  const { user } = useAuth();
  const [repositories, setRepositories] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<any>(null);
  const [isReposLoading, setIsReposLoading] = useState(true);

  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  const [files, setFiles] = useState<any[]>([]);
  const [activeFile, setActiveFile] = useState<string>('');
  const [isFileSelectorOpen, setIsFileSelectorOpen] = useState(false);
  const [fileSearchQuery, setFileSearchQuery] = useState('');

  const [messageAnalysis, setMessageAnalysis] = useState<Record<string, any>>({});

  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    'Explain backend flow',
    'Find auth middleware',
    'Show API relationships',
    'Review latest PR',
    'Explain database structure',
  ]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);


  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const MODEL_OPTIONS = [
    { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', provider: 'freemodel', desc: 'Best for deep code analysis' },
    { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5', provider: 'freemodel', desc: 'Fast & lightweight' },
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', provider: 'gemini', desc: 'Free & fast for quick answers' },
    { id: 'openai/gpt-4o', label: 'GPT-4o', provider: 'openrouter', desc: 'Best for general tasks' },
    { id: 'deepseek/deepseek-chat', label: 'DeepSeek V3', provider: 'openrouter', desc: 'Powerful open-source reasoning' },
    { id: 'mistralai/mistral-small-3.1-24b-instruct', label: 'Mistral Small 3.1', provider: 'openrouter', desc: 'Fast & efficient' },
    { id: 'qwen/qwen-2.5-72b-instruct', label: 'Qwen 2.5 72B', provider: 'openrouter', desc: 'Strong general-purpose' },
  ];
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0]);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);

  const { openImportRepo } = useImportRepo();
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modelSelectorRef = useRef<HTMLDivElement>(null);

  const findFileIdByPath = (filePath: string) => {
    const match = files.find(f => f.path === filePath);
    return match?.id || null;
  };

  const handleFileNavigate = (filePath: string) => {
    if (!selectedRepo) return;
    const fileId = findFileIdByPath(filePath);
    if (fileId) {
      showToast(`Opening ${filePath.split('/').pop()}`, 'info');
      router.push(`/repositories/${selectedRepo.id}?fileId=${fileId}`);
    } else {
      showToast(`File not found: ${filePath}`, 'error');
    }
  };

  useEffect(() => {
    async function loadRepos() {
      try {
        setIsReposLoading(true);
        const res = await api.repositories.list();
        setRepositories(res.repositories || []);
        if (res.repositories && res.repositories.length > 0) {
          setSelectedRepo(res.repositories[0]);
        }
      } catch (err) {
        console.error("Failed to load repositories:", err);
      } finally {
        setIsReposLoading(false);
      }
    }
    loadRepos();
  }, []);

  useEffect(() => {
    if (!selectedRepo) return;
    setActiveSession(null);
    setMessages([]);
    setActiveFile('');
    setFileSearchQuery('');
    loadSessions(selectedRepo.id);
    loadFiles(selectedRepo.id);
    loadSuggestions(selectedRepo.id);
  }, [selectedRepo]);

  useEffect(() => {
    if (!activeSession) {
      setMessages([]);
      return;
    }
    loadMessages(activeSession.id);
  }, [activeSession]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFileSelectorOpen(false);
      }
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target as Node)) {
        setIsModelSelectorOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadSessions = async (repoId: string) => {
    try {
      setIsSessionsLoading(true);
      const res = await api.ai.sessions.list(repoId);
      setSessions(res.sessions || []);
      if (res.sessions && res.sessions.length > 0) {
        setActiveSession(res.sessions[0]);
      }
    } catch (err) {
      console.error("Failed to load chat sessions:", err);
    } finally {
      setIsSessionsLoading(false);
    }
  };

  const loadFiles = async (repoId: string) => {
    try {
      const res = await api.repositories.getTree(repoId);
      const fileNodes = (res.files || []).filter(f => f.type === 'file');
      setFiles(fileNodes);
    } catch (err) {
      console.error("Failed to load repository files:", err);
    }
  };

  const loadSuggestions = async (repoId: string) => {
    try {
      setIsSuggestionsLoading(true);
      const res = await api.ai.getPrompts(repoId);
      if (res.prompts && res.prompts.length > 0) {
        setSuggestedPrompts(res.prompts);
      }
    } catch (err) {
      console.error("Failed to load suggestions:", err);
    } finally {
      setIsSuggestionsLoading(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      setIsMessagesLoading(true);
      const res = await api.ai.sessions.get(sessionId);
      setMessages(res.messages || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setIsMessagesLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!selectedRepo) return;
    try {
      const res = await api.ai.sessions.create(selectedRepo.id, "New conversation");
      setSessions(prev => [res.session, ...prev]);
      setActiveSession(res.session);
    } catch (err) {
      console.error("Failed to create new session:", err);
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      await api.ai.sessions.delete(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSession?.id === sessionId) {
        setActiveSession(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = queryText || input.trim();
    if (!textToSend || !selectedRepo) return;

    let currentSession = activeSession;

    if (!currentSession) {
      try {
        const res = await api.ai.sessions.create(selectedRepo.id, textToSend.substring(0, 30) + '...');
        currentSession = res.session;
        setSessions((prev: any[]) => [currentSession, ...prev]);
        setActiveSession(currentSession);
      } catch (err) {
        console.error('Failed to initialize session:', err);
        return;
      }
    }

    if (!queryText) setInput('');
    setIsAiThinking(true);
    setAnalysisStatus('Scanning repository files...');

    const mockUserMsg = { id: 'temp-user', role: 'user', content: textToSend, createdAt: new Date() };
    setMessages((prev: any[]) => [...prev, mockUserMsg]);

    try {
      const chatRes = await api.ai.chat(currentSession.id, textToSend, activeFile || undefined, selectedModel.provider, selectedModel.id);

      if (chatRes.analysis) {
        setLastAnalysis(chatRes.analysis);
        if (chatRes.aiMessage?.id) {
          setMessageAnalysis(prev => ({ ...prev, [chatRes.aiMessage.id]: chatRes.analysis }));
        }
        const { detectedIntents, filesFetched, referencedFiles, provider, model } = chatRes.analysis;
        const intentLabel = detectedIntents?.length > 0
          ? detectedIntents.map((i: string) => i.charAt(0).toUpperCase() + i.slice(1)).join(', ')
          : 'General';
        const fileCount = filesFetched || 0;
        const refCount = referencedFiles?.length || 0;
        const modelInfo = provider && model ? ` via ${provider === 'freemodel' ? 'FreeModel' : provider === 'gemini' ? 'Gemini' : provider} (${model})` : '';
        setAnalysisStatus(`${intentLabel} — ${fileCount} file${fileCount !== 1 ? 's' : ''} analyzed${refCount > 0 ? `, ${refCount} referenced in response` : ''}${modelInfo}`);
      }

      if (chatRes.title && currentSession.title !== chatRes.title) {
        setSessions((prev: any[]) => prev.map(s => s.id === currentSession.id ? { ...s, title: chatRes.title } : s));
        setActiveSession((prev: any) => prev ? { ...prev, title: chatRes.title } : null);
      }

      loadMessages(currentSession.id);
    } catch (err: any) {
      console.error('Failed to deliver AI chat message:', err);
      setAnalysisStatus('');
      setMessages((prev: any[]) => [
        ...prev,
        {
          id: 'temp-error',
          role: 'assistant',
          content: `⚠️ **AI Error:** ${err?.message || 'Connection to the AI provider failed. Check your API key.'}`,
          createdAt: new Date()
        }
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Code copied to clipboard', 'success');
  };

  function ShikiCodeBlock({ code, lang, codeId }: { code: string; lang: string; codeId: string }) {
    const [html, setHtml] = useState<string | null>(null);

    useEffect(() => {
      highlightCode(code, lang).then(setHtml);
    }, [code, lang]);

    return (
      <div className="my-3 overflow-hidden rounded-xl border border-white/[0.08] bg-neutral-950 font-mono text-[11px] shadow-subtle">
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-4 py-2 text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Code size={12} className="text-accent" />
            {lang}
          </span>
          <button
            onClick={() => handleCopyCode(code)}
            className="flex items-center gap-1 text-[10px] hover:text-white transition-colors"
          >
            Copy
          </button>
        </div>
        {html ? (
          <div className="overflow-x-auto p-4 max-h-[350px]" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre className="overflow-x-auto p-4 max-h-[350px]">
            <code>{code}</code>
          </pre>
        )}
      </div>
    );
  }

  const handleRegenerate = async (messageId: string) => {
    if (!activeSession) return;
    const msgIndex = messages.findIndex(m => m.id === messageId);
    if (msgIndex < 1) return;
    const userMsg = messages[msgIndex - 1];
    if (userMsg.role !== 'user') return;

    setIsAiThinking(true);
    setAnalysisStatus('Regenerating response...');

    try {
      const chatRes = await api.ai.chat(activeSession.id, userMsg.content, activeFile || undefined, selectedModel.provider, selectedModel.id);
      loadMessages(activeSession.id);
    } catch (err) {
      console.error('Failed to regenerate:', err);
    } finally {
      setIsAiThinking(false);
    }
  };

  const filteredFiles = files.filter(f =>
    f.path.toLowerCase().includes(fileSearchQuery.toLowerCase())
  ).slice(0, 10);

  if (isReposLoading) {
    return (
      <div className="flex h-[calc(100vh-140px)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-sm text-neutral-400">Loading codebases...</p>
        </div>
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <div className="flex h-[calc(100vh-140px)] items-center justify-center p-6 text-center">
        <div className="max-w-md rounded-2xl border border-white/[0.06] bg-panel-glass p-8 shadow-glow">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 mb-4 text-accent">
            <FolderOpen size={24} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Imported Repositories</h2>
          <p className="text-sm text-neutral-400 mb-6">
            You need to import and scan a GitHub repository before starting an AI Chat session.
          </p>
          <button
            onClick={openImportRepo}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-white transition-colors"
          >
            Import Repository
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-100px)] border border-white/[0.04] rounded-2xl overflow-hidden bg-neutral-950">

      <div className="w-[280px] bg-neutral-900 border-r border-white/[0.04] flex flex-col shrink-0">

        <div className="p-4 border-b border-white/[0.04]">
          <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
            Active Codebase
          </label>
          <div className="relative">
            <select
              value={selectedRepo?.id || ''}
              onChange={(e) => {
                const repoObj = repositories.find(r => r.id === e.target.value);
                setSelectedRepo(repoObj);
              }}
              className="w-full appearance-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 pr-8 text-xs font-medium text-white outline-none focus:border-accent transition-colors"
            >
              {repositories.map(repo => (
                <option key={repo.id} value={repo.id} className="bg-neutral-900">
                  {repo.fullName}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        <div className="px-4 py-3">
          <button
            onClick={handleCreateSession}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] px-3 py-2.5 text-xs text-neutral-300 hover:text-white hover:border-white/[0.24] hover:bg-white/[0.02] transition-all"
          >
            <Plus size={14} />
            New Conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-4">
          <div className="px-2 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
            Recent Dialogues
          </div>
          {isSessionsLoading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-xs text-neutral-400">
              <Loader2 size={12} className="animate-spin" />
              Loading history...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-neutral-500 italic">
              No previous threads.
            </div>
          ) : (
            sessions.map(s => {
              const isActive = activeSession?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setActiveSession(s)}
                  className={`group relative flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-xs cursor-pointer transition-all ${
                    isActive
                      ? 'bg-accent/10 text-white font-medium border border-accent/20'
                      : 'text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200 border border-transparent'
                  }`}
                >
                  <span className="truncate pr-4 w-full flex items-center gap-1.5">
                    <MessageSquare size={13} className={isActive ? 'text-accent' : 'text-neutral-400'} />
                    {s.title}
                  </span>
                  <button
                    onClick={(e) => handleDeleteSession(e, s.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-400 transition-opacity absolute right-2"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-neutral-950">

        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
          <div>
            <h2 className="text-sm font-semibold text-white">
              {activeSession ? activeSession.title : "Codebase Query"}
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mt-0.5">
              <span>{selectedRepo?.fullName}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <GitBranch size={10} /> {selectedRepo?.defaultBranch || 'main'}
              </span>
            </div>
          </div>

          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setIsFileSelectorOpen(!isFileSelectorOpen)}
              className={`flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-3 py-1.5 text-xs transition-all hover:bg-white/[0.04] ${
                activeFile ? 'bg-accent/10 border-accent/30 text-white font-medium' : 'bg-white/[0.02] text-neutral-400'
              }`}
            >
              <FileText size={13} className={activeFile ? 'text-accent' : ''} />
              <span className="max-w-[150px] truncate">
                {activeFile ? activeFile.split('/').pop() : 'Select Focus File'}
              </span>
              <ChevronDown size={12} />
            </button>

            {isFileSelectorOpen && (
              <div className="absolute right-0 mt-1 w-64 rounded-xl border border-white/[0.08] bg-neutral-900 p-2 shadow-elevated z-50 animate-fade-in">
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" size={13} />
                  <input
                    type="text"
                    placeholder="Search file path..."
                    value={fileSearchQuery}
                    onChange={(e) => setFileSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-accent"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  <button
                    onClick={() => { setActiveFile(''); setIsFileSelectorOpen(false); }}
                    className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs transition-colors flex items-center justify-between ${
                      !activeFile ? 'bg-accent/15 text-white' : 'text-neutral-400 hover:bg-white/[0.03]'
                    }`}
                  >
                    <span>No active file (Full codebase context)</span>
                    {!activeFile && <Check size={12} className="text-accent" />}
                  </button>
                  {filteredFiles.map(f => (
                    <button
                      key={f.id}
                      onClick={() => { setActiveFile(f.path); setIsFileSelectorOpen(false); }}
                      className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs transition-colors flex items-center justify-between ${
                        activeFile === f.path ? 'bg-accent/15 text-white' : 'text-neutral-400 hover:bg-white/[0.03]'
                      }`}
                    >
                      <span className="truncate pr-2">{f.path}</span>
                      {activeFile === f.path && <Check size={12} className="text-accent" />}
                    </button>
                  ))}
                  {filteredFiles.length === 0 && (
                    <div className="text-center py-3 text-xs text-neutral-500 italic">No files found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth">
          <div className="mx-auto max-w-3xl space-y-6">

            {isMessagesLoading ? (
              <div className="flex h-40 items-center justify-center flex-col gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
                <span className="text-xs text-neutral-500">Loading dialogue...</span>
              </div>
            ) : messages.length === 0 ? (

              <div className="flex flex-col items-center justify-center py-16 text-center animate-slide-up">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 mb-4 text-accent shadow-glow">
                  <Sparkles size={20} className="animate-pulse-dot" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  Query codebase: {selectedRepo?.fullName}
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mb-8">
                  Get insights about frameworks, routing controllers, auth flows, database schema design, and dependencies.
                </p>

                <div className="w-full max-w-md">
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-3">
                    <Sparkles size={11} className="text-accent" />
                    Suggested Inquiries
                  </div>
                  {isSuggestionsLoading ? (
                    <div className="flex items-center justify-center py-2 gap-1 text-[11px] text-neutral-400">
                      <Loader2 size={10} className="animate-spin" />
                      Analyzing codebase context...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {suggestedPrompts.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendQuery(p)}
                          className="w-full text-left rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-xs text-neutral-300 hover:bg-accent/10 hover:text-white hover:border-accent/20 transition-all flex items-center justify-between"
                        >
                          <span className="truncate">{p}</span>
                          <ArrowRight size={12} className="text-neutral-500 group-hover:text-accent" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            ) : (

              messages.map((msg, i) => {
                const isAi = msg.role === 'assistant' || msg.role === 'ai';
                return (
                  <div key={msg.id || i} className={`flex gap-4 ${!isAi ? 'flex-row-reverse' : ''} animate-fade-in`}>
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold overflow-hidden ${
                        isAi
                          ? 'bg-accent/15 text-accent border border-accent/20'
                          : 'bg-white/[0.06] text-neutral-300'
                      }`}
                    >
                      {isAi ? (
                        <Image src="/Repolyx.png" alt="Repolyx" width={32} height={32} className="object-contain p-0.5" />
                      ) : user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        user?.username?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>

                    <div className={`flex flex-col ${!isAi ? 'items-end' : 'items-start'} max-w-[85%]`}>
                      <div
                        className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                          isAi
                            ? 'bg-white/[0.03] text-neutral-200 border border-white/[0.04]'
                            : 'bg-accent/10 text-white font-medium border border-accent/20'
                        }`}
                      >
                        {isAi ? (
                          <div className="prose prose-invert max-w-none text-xs">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code({ node, className, children, ...props }: any) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  const codeText = String(children).replace(/\n$/, '');
                                  const codeId = `code-${i}-${Math.random().toString(36).substr(2, 5)}`;
                                  return match ? (
                                    <ShikiCodeBlock code={codeText} lang={match[1]} codeId={codeId} />
                                  ) : (
                                    (() => {
                                      const text = String(children);
                                      if (isFilePath(text)) {
                                        return (
                                          <button
                                            onClick={() => handleFileNavigate(text)}
                                            className="inline-flex items-center gap-1 rounded bg-accent/10 hover:bg-accent/20 px-1.5 py-0.5 text-[11px] text-accent font-mono cursor-pointer border border-accent/20 hover:border-accent/40 transition-all"
                                            title={`Open ${text}`}
                                          >
                                            <File size={8} />
                                            {text}
                                          </button>
                                        );
                                      }
                                      return (
                                        <code className="bg-white/[0.08] rounded px-1.5 py-0.5 text-[11px] text-accent font-mono" {...props}>
                                          {children}
                                        </code>
                                      );
                                    })()
                                  );
                                },
                                table({ children }) {
                                  return (
                                    <div className="my-3 overflow-x-auto rounded-xl border border-white/[0.08]">
                                      <table className="min-w-full text-[11px] border-collapse">{children}</table>
                                    </div>
                                  );
                                },
                                th({ children }) {
                                  return <th className="border-b border-white/[0.08] bg-white/[0.03] px-3 py-2 text-left text-[10px] font-semibold text-neutral-300">{children}</th>;
                                },
                                td({ children }) {
                                  return <td className="border-b border-white/[0.04] px-3 py-2 text-neutral-400">{children}</td>;
                                },
                                h1({ children }) { return <h1 className="text-sm font-bold text-white mb-2 mt-4">{children}</h1>; },
                                h2({ children }) { return <h2 className="text-xs font-bold text-white mb-2 mt-3">{children}</h2>; },
                                h3({ children }) { return <h3 className="text-[11px] font-bold text-white mb-1 mt-3">{children}</h3>; },
                                ul({ children }) { return <ul className="list-disc pl-4 space-y-1 my-2">{children}</ul>; },
                                ol({ children }) { return <ol className="list-decimal pl-4 space-y-1 my-2">{children}</ol>; },
                                p({ children }) { return <p className="mb-2 leading-relaxed last:mb-0">{children}</p>; },
                                blockquote({ children }) {
                                  return <blockquote className="border-l-2 border-accent/30 pl-3 my-2 text-neutral-400 italic">{children}</blockquote>;
                                },
                                a({ href, children }) {
                                  return <a href={href} className="text-accent underline hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">{children}</a>;
                                },
                                hr() { return <hr className="my-4 border-white/[0.06]" />; },
                                pre({ children }) {
                                  return <div className="my-2">{children}</div>;
                                },
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>

                      {isAi && (
                        <div className="mt-1 px-1 text-[9px] text-neutral-500 flex items-center gap-2 flex-wrap">
                          <span>{msg.provider ? `${msg.provider === 'freemodel' ? 'FreeModel' : msg.provider === 'gemini' ? 'Gemini' : msg.provider} (${msg.model || 'AI'})` : 'AI Engine'}</span>
                          <span>·</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {(msg.analysis?.referencedFiles || messageAnalysis[msg.id]?.referencedFiles)?.length > 0 && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <File size={9} />
                                {(msg.analysis?.referencedFiles || messageAnalysis[msg.id]?.referencedFiles).length} file{(msg.analysis?.referencedFiles || messageAnalysis[msg.id]?.referencedFiles).length !== 1 ? 's' : ''} referenced
                              </span>
                            </>
                          )}
                          <button
                            onClick={() => handleRegenerate(msg.id)}
                            className="ml-1 text-[9px] text-neutral-500 hover:text-accent transition-colors"
                            title="Regenerate response"
                          >
                            ↻ Regenerate
                          </button>
                        </div>
                      )}

                      {(msg.analysis?.referencedFiles || messageAnalysis[msg.id]?.referencedFiles)?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {(msg.analysis?.referencedFiles || messageAnalysis[msg.id]?.referencedFiles).slice(0, 5).map((rf: any, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => handleFileNavigate(rf.path)}
                              className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-[9px] text-neutral-400 font-mono hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-all cursor-pointer"
                              title={`Open ${rf.path}`}
                            >
                              <File size={8} className="text-accent" />
                              {rf.path.split('/').pop()}
                              {rf.purpose && <span className="text-neutral-500">[{rf.purpose}]</span>}
                              <ExternalLink size={7} className="opacity-0 group-hover:opacity-100" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {isAiThinking && (
              <div className="flex gap-3 animate-fade-in">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 border border-accent/20 overflow-hidden">
                  <Image src="/Repolyx.png" alt="Repolyx" width={32} height={32} className="object-contain p-0.5 opacity-80" />
                </div>
                <div className="flex flex-col items-start gap-1.5">
                  <div className="rounded-xl px-3 py-2 text-xs bg-white/[0.02] border border-white/[0.06] flex items-center gap-2">
                    <Loader2 size={11} className="animate-spin text-accent" />
                    <span className="text-neutral-300 font-medium">{analysisStatus || 'Scanning repository files...'}</span>
                  </div>
                  {lastAnalysis?.detectedIntents && (
                    <div className="flex flex-wrap gap-1">
                      {lastAnalysis.detectedIntents.map((intent: string, idx: number) => (
                        <span key={idx} className="inline-flex items-center gap-1 rounded-md bg-accent/5 border border-accent/10 px-2 py-0.5 text-[9px] text-accent">
                          <ScanSearch size={8} />
                          {intent}
                        </span>
                      ))}
                    </div>
                  )}
                  {lastAnalysis?.matchedFiles && lastAnalysis.matchedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1 max-w-md">
                      {lastAnalysis.matchedFiles.slice(0, 4).map((mf: any, idx: number) => (
                        <span key={idx} className="inline-flex items-center gap-1 rounded-md bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 text-[9px] text-neutral-400 font-mono">
                          <File size={8} />
                          {mf.path.split('/').pop()}
                          {mf.purpose && <span className="text-neutral-500">[{mf.purpose}]</span>}
                        </span>
                      ))}
                      {lastAnalysis.matchedFiles.length > 4 && (
                        <span className="text-[9px] text-neutral-500">+{lastAnalysis.matchedFiles.length - 4} more</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        <div className="border-t border-white/[0.04] p-4 bg-neutral-950">
          <div className="mx-auto max-w-3xl">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendQuery();
                  }
                }}
                rows={1}
                placeholder="Ask questions about architecture, API hooks, user models, auth schemas..."
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] pl-4 pr-16 py-3.5 text-xs text-white outline-none placeholder:text-neutral-500 focus:border-accent focus:bg-white/[0.04] transition-all resize-none shadow-subtle"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <button
                  onClick={() => handleSendQuery()}
                  disabled={!input.trim() || isAiThinking}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-neutral-950 hover:bg-white transition-colors disabled:opacity-20 disabled:pointer-events-none"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-[9px] text-neutral-500 px-1">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Codebase context active
                </span>
                {activeFile && (
                  <span className="flex items-center gap-1 text-accent font-medium bg-accent/5 px-1.5 py-0.5 rounded">
                    Focused: {activeFile}
                  </span>
                )}
                {lastAnalysis && (
                  <span className="flex items-center gap-1 text-neutral-400 bg-white/[0.02] px-1.5 py-0.5 rounded">
                    <ScanSearch size={9} />
                    {lastAnalysis.filesFetched || 0} files indexed
                  </span>
                )}
              </div>
              <div ref={modelSelectorRef} className="relative">
                <button
                  onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
                  className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[10px] text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04] transition-all"
                >
                  <Brain size={10} className="text-accent" />
                  <span className="max-w-[90px] truncate">{selectedModel.label}</span>
                  <ChevronDown size={10} />
                </button>

                {isModelSelectorOpen && (
                  <div className="absolute right-0 bottom-full mb-1 w-56 rounded-xl border border-white/[0.08] bg-neutral-900 p-1.5 shadow-elevated z-50 animate-fade-in">
                    {MODEL_OPTIONS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => { setSelectedModel(m); setIsModelSelectorOpen(false); }}
                        className={`w-full text-left rounded-lg px-3 py-2 text-xs transition-colors ${
                          selectedModel.id === m.id
                            ? 'bg-accent/15 text-white'
                            : 'text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{m.label}</span>
                          {selectedModel.id === m.id && <Check size={11} className="text-accent" />}
                        </div>
                        <div className="text-[9px] text-neutral-500 mt-0.5">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
