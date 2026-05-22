'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Sparkles, FileText, Download, CheckCircle2, Loader2,
  AlertTriangle, RefreshCw, Copy, ExternalLink, ChevronDown, ChevronUp,
  ListChecks, Wand2,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { DocHeader } from '@/components/docs/DocHeader';
import { DocSidebar, DOC_SECTIONS } from '@/components/docs/DocSidebar';

const PROGRESS_STEPS = [
  { id: 'scanning', label: 'Scanning files', icon: '🔍' },
  { id: 'detecting', label: 'Detecting APIs', icon: '🔌' },
  { id: 'architecture', label: 'Understanding architecture', icon: '🏗️' },
  { id: 'building', label: 'Building documentation', icon: '📝' },
  { id: 'generating', label: 'Generating markdown files', icon: '✨' },
];

const DOC_FILE_LABELS: Record<string, string> = {
  'README.md': 'README Generator',
  'API.md': 'API Documentation',
  'ARCHITECTURE.md': 'Architecture Summary',
  'SETUP.md': 'Setup Guide',
  'SECURITY.md': 'Authentication Flow',
  'ENVIRONMENT.md': 'Environment Docs',
  'DEPLOYMENT.md': 'Deployment Guide',
  'CHANGELOG.md': 'Changelog',
};

function renderMarkdown(text: string): string {
  let html = text
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold text-white mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold text-white mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold text-white mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-white/[0.06] text-emerald-300 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="text-neutral-400 text-sm ml-4 list-disc">$1</li>')
    .replace(/\|(.+)\|/g, (match) => {
      if (match.includes('---')) return '<hr class="border-white/[0.06] my-4" />';
      const cells = match.split('|').filter(Boolean);
      if (cells.length < 2) return match;
      return '<tr>' + cells.map((c) => `<td class="text-xs text-neutral-400 px-3 py-1.5 border-b border-white/[0.06]">${c.trim()}</td>`).join('') + '</tr>';
    })
    .replace(/\n\n/g, '</p><p class="text-sm text-neutral-400 leading-relaxed mb-3">');
  html = '<p class="text-sm text-neutral-400 leading-relaxed mb-3">' + html + '</p>';
  html = html.replace(/<tr>.*?<\/tr>/g, (match) => {
    if (match.includes('|---')) return '';
    return match;
  });
  return html;
}

function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function DocCard({ filename, content, isBeginner }: { filename: string; content: string; isBeginner: boolean }) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [content]);

  const handleDownload = useCallback(() => {
    downloadMarkdown(filename, content);
  }, [filename, content]);

  const label = DOC_FILE_LABELS[filename] || filename.replace('.md', '');
  const isReadme = filename === 'README.md';

  return (
    <motion.div
      className={`rounded-2xl border ${isReadme ? 'border-emerald-500/10' : 'border-white/[0.06]'} bg-[#090b10] overflow-hidden`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isReadme ? 'border-emerald-500/10' : 'border-white/[0.06]'}`}>
        <div className="flex items-center gap-2.5">
          {isReadme ? (
            <BookOpen size={14} className="text-emerald-400" />
          ) : (
            <FileText size={14} className="text-neutral-400" />
          )}
          <div>
            <span className={`text-sm font-medium ${isReadme ? 'text-emerald-300' : 'text-white'}`}>{label}</span>
            <span className="ml-2 text-[10px] text-neutral-600 font-mono">{filename}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-white/[0.04] text-neutral-500 hover:text-neutral-300 transition-colors"
            title="Copy markdown"
          >
            <Copy size={13} />
            {copied && <span className="text-[10px] text-emerald-400 ml-1">Copied!</span>}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 rounded-lg hover:bg-white/[0.04] text-neutral-500 hover:text-neutral-300 transition-colors"
            title="Download .md"
          >
            <Download size={13} />
          </button>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg hover:bg-white/[0.04] text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 max-h-[600px] overflow-y-auto">
              <div
                className="prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isBeginner && (
        <div className="px-4 py-2.5 bg-emerald-500/[0.02] border-t border-emerald-500/5">
          <p className="text-[11px] text-neutral-500">
            <span className="text-emerald-400 font-medium">Tip:</span> This file was auto-generated by AI.
            You can export it as Markdown or copy the content for your repository.
          </p>
        </div>
      )}
    </motion.div>
  );
}

function MissingDocsCard({ missingDocs, onGenerateSection }: { missingDocs: any[]; onGenerateSection: (id: string) => void }) {
  if (!missingDocs?.length) return null;

  return (
    <motion.div
      className="rounded-2xl border border-amber-500/10 bg-[#090b10] overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-amber-500/10">
        <Wand2 size={14} className="text-amber-400" />
        <span className="text-sm font-medium text-amber-300">Generate Missing Docs</span>
        <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-full">{missingDocs.length}</span>
      </div>
      <div className="p-3 space-y-1.5">
        {missingDocs.map((md: any, i: number) => (
          <div key={i} className="flex items-center gap-2.5 rounded-lg bg-white/[0.02] p-2.5">
            <AlertTriangle size={11} className="text-amber-400 shrink-0" />
            <span className="text-xs text-neutral-400 flex-1">{md.message}</span>
            <button
              type="button"
              onClick={() => onGenerateSection(md.type)}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Generate
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function DocsPage() {
  const [selectedRepo, setSelectedRepo] = useState('');
  const [repositories, setRepositories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<{ id: string; label: string; done: boolean; current: boolean }[]>([]);
  const [generatedDocs, setGeneratedDocs] = useState<Record<string, string> | null>(null);
  const [sections, setSections] = useState<any>(null);
  const [missingDocs, setMissingDocs] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState('readme');
  const [isBeginner, setIsBeginner] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasData, setHasData] = useState<Record<string, boolean>>({});
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchRepositories();
  }, []);

  useEffect(() => {
    if (selectedRepo) {
      fetchExistingDocs();
    }
  }, [selectedRepo]);

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  async function fetchRepositories() {
    try {
      const data = await api.repositories.list();
      const repos = (data.repositories || []).map((r: any) => ({ id: r.id, name: r.name }));
      setRepositories(repos);
    } catch {
      // handled silently
    }
  }

  async function fetchExistingDocs() {
    if (!selectedRepo) return;
    setLoading(true);
    try {
      const data = await api.docs.get(selectedRepo);
      if (data?.sections) {
        setSections(data.sections);
        setHasData({
          readme: true,
          api: !!data.sections.apis?.routes?.length,
          setup: true,
          architecture: !!data.sections.architecture,
          changelog: true,
          'endpoint-docs': !!data.sections.apis?.routes?.length,
          environment: !!data.sections.environment,
          database: !!data.sections.database?.dbFiles?.length,
          auth: !!data.sections.auth?.flows?.length,
          deployment: !!data.sections.deployment?.deployFiles?.length,
          'folder-structure': !!data.sections.architecture?.directories?.length,
          'ai-suggestions': false,
        });
      }
    } catch {
      // handled silently
    } finally {
      setLoading(false);
    }
  }

  function runProgressAnimation() {
    const steps = PROGRESS_STEPS.map((s, i) => ({
      ...s,
      done: false,
      current: i === 0,
    }));
    setProgress(steps);

    let index = 0;
    progressTimerRef.current = setInterval(() => {
      index++;
      if (index >= PROGRESS_STEPS.length) {
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        return;
      }
      setProgress((prev) =>
        prev.map((p, i) => ({
          ...p,
          done: i < index,
          current: i === index,
        }))
      );
    }, 1200);
  }

  async function handleGenerateDocs() {
    if (!selectedRepo || generating) return;
    setGenerating(true);
    setGeneratedDocs(null);
    setMissingDocs([]);
    runProgressAnimation();

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const data = await api.docs.generate(selectedRepo);
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setProgress(PROGRESS_STEPS.map((s) => ({ ...s, done: true, current: false })));

      setGeneratedDocs(data.docs || null);
      setMissingDocs(data.missingDocs || []);
      setSections(data.sections || null);

      if (data.sections) {
        setHasData({
          readme: true,
          api: !!data.sections.apis?.routes?.length,
          setup: true,
          architecture: !!data.sections.architecture,
          changelog: true,
          'endpoint-docs': !!data.sections.apis?.routes?.length,
          environment: !!data.sections.environment,
          database: !!data.sections.database?.dbFiles?.length,
          auth: !!data.sections.auth?.flows?.length,
          deployment: !!data.sections.deployment?.deployFiles?.length,
          'folder-structure': !!data.sections.architecture?.directories?.length,
          'ai-suggestions': (data.missingDocs?.length ?? 0) > 0,
        });
      }

      setActiveSection('readme');
    } catch {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setProgress(PROGRESS_STEPS.map((s) => ({ ...s, done: false, current: false })));
    } finally {
      setGenerating(false);
    }
  }

  async function handleSync() {
    if (!selectedRepo) return;
    try {
      await api.repositories.scan(selectedRepo);
      fetchExistingDocs();
    } catch {
      // handled silently
    }
  }

  function handleExportMarkdown() {
    if (!generatedDocs) return;
    Object.entries(generatedDocs).forEach(([filename, content]) => {
      downloadMarkdown(filename, content);
    });
  }

  function handleRepoChange(id: string) {
    setSelectedRepo(id);
    setGeneratedDocs(null);
    setMissingDocs([]);
    setActiveSection('readme');
    setSections(null);
    setHasData({});
  }

  function handleGenerateSection(type: string) {
    const sectionMap: Record<string, string> = {
      architecture: 'architecture',
      api: 'endpoint-docs',
      auth: 'auth',
      database: 'database',
      environment: 'environment',
      deployment: 'deployment',
      components: 'architecture',
    };
    const target = sectionMap[type] || 'readme';
    setActiveSection(target);
  }

  const currentDocFilename = DOC_SECTIONS.find((s) => s.id === activeSection)
    ? Object.keys(DOC_FILE_LABELS).find(
        (key) => DOC_FILE_LABELS[key] === DOC_SECTIONS.find((s) => s.id === activeSection)?.label
      )
    : null;

  const allDocKeys = generatedDocs ? Object.keys(generatedDocs) : [];
  const hasAnyDocs = allDocKeys.length > 0;

  function renderWorkspace() {
    if (!selectedRepo) {
      return (
        <div className="rounded-2xl border border-white/[0.06] bg-[#090b10] p-12 text-center">
          <BookOpen size={28} className="mx-auto text-neutral-600 mb-4" />
          <h2 className="text-base font-semibold text-white mb-2">AI Documentation Workspace</h2>
          <p className="text-sm text-neutral-500 max-w-md mx-auto">
            Select a repository and generate AI-powered documentation for your project.
            Repolyx will scan your code and create professional markdown files automatically.
          </p>
        </div>
      );
    }

    if (generating) {
      return (
        <motion.div
          className="rounded-2xl border border-white/[0.06] bg-[#090b10] p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Loader2 size={18} className="text-emerald-400 animate-spin" />
            <div>
              <h2 className="text-sm font-semibold text-white">Generating Documentation</h2>
              <p className="text-xs text-neutral-500 mt-0.5">AI is analyzing your repository...</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {progress.map((step) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className={`flex h-5 w-5 items-center justify-center rounded-full transition-all ${
                  step.done ? 'bg-emerald-500/20 text-emerald-400' :
                  step.current ? 'bg-emerald-500/10 text-emerald-400' :
                  'bg-white/[0.03] text-neutral-600'
                }`}>
                  {step.done ? (
                    <CheckCircle2 size={12} />
                  ) : step.current ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-neutral-600" />
                  )}
                </div>
                <span className={`text-xs transition-colors ${
                  step.done ? 'text-neutral-300' :
                  step.current ? 'text-white font-medium' :
                  'text-neutral-600'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 w-full bg-white/[0.04] rounded-full h-1 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${(progress.filter((p) => p.done).length / PROGRESS_STEPS.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </motion.div>
      );
    }

    if (!hasAnyDocs) {
      return (
        <div className="rounded-2xl border border-white/[0.06] bg-[#090b10] p-12 text-center">
          <Sparkles size={28} className="mx-auto text-neutral-600 mb-4" />
          <h2 className="text-base font-semibold text-white mb-2">Ready to Generate</h2>
          <p className="text-sm text-neutral-500 max-w-md mx-auto mb-4">
            Click <span className="text-emerald-400 font-medium">Generate Docs</span> to create professional documentation
            with AI analysis of your codebase.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-md mx-auto">
            {['README.md', 'API.md', 'ARCHITECTURE.md', 'SETUP.md', 'SECURITY.md', 'ENVIRONMENT.md', 'DEPLOYMENT.md', 'CHANGELOG.md'].map((f) => (
              <div key={f} className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-2.5 py-2 text-center">
                <span className="text-[10px] text-neutral-500 font-mono">{f}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    const missingCount = missingDocs?.length || 0;

    return (
      <div className="space-y-4">
        {missingCount > 0 && (
          <MissingDocsCard missingDocs={missingDocs} onGenerateSection={handleGenerateSection} />
        )}

        {activeSection === 'ai-suggestions' ? (
          <div className="rounded-2xl border border-amber-500/10 bg-[#090b10] p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <Wand2 size={16} className="text-amber-400" />
              <h2 className="text-sm font-semibold text-white">AI Suggestions</h2>
            </div>
            {missingCount > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-neutral-400 mb-3">
                  AI detected {missingCount} documentation gaps in your repository:
                </p>
                {missingDocs.map((md: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/[0.06] p-3">
                    <AlertTriangle size={12} className="text-amber-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-neutral-300">{md.message}</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Section: {md.type}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleGenerateSection(md.type)}
                      className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded hover:bg-emerald-500/20 transition-colors"
                    >
                      Generate
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <ListChecks size={24} className="mx-auto text-emerald-400 mb-2" />
                <p className="text-xs text-neutral-400">All documentation sections are complete! No missing docs detected.</p>
              </div>
            )}
          </div>
        ) : generatedDocs ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={13} className="text-neutral-500" />
              <span className="text-xs text-neutral-500">
                {allDocKeys.length} file{allDocKeys.length !== 1 ? 's' : ''} generated
              </span>
            </div>
            {allDocKeys.map((filename) => (
              <DocCard
                key={filename}
                filename={filename}
                content={generatedDocs[filename]}
                isBeginner={isBeginner}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DocHeader
        selectedRepo={selectedRepo}
        onRepoChange={handleRepoChange}
        isBeginner={isBeginner}
        onModeToggle={() => setIsBeginner(!isBeginner)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        repositories={repositories}
        onGenerateDocs={handleGenerateDocs}
        onExportMarkdown={handleExportMarkdown}
        onSync={handleSync}
        generating={generating}
        hasDocs={hasAnyDocs}
      />

      <div className="grid gap-6 xl:grid-cols-[220px_1fr]">
        <div>
          <DocSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            hasData={hasData}
            loading={loading || generating}
            repoName={repositories.find((r) => r.id === selectedRepo)?.name}
            missingCount={missingDocs?.length || 0}
          />
        </div>

        <div className="min-h-[400px]">
          {renderWorkspace()}
        </div>
      </div>
    </div>
  );
}
