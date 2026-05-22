'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Sparkles, FileText, Download, CheckCircle2, Loader2,
  AlertTriangle, RefreshCw, Copy, ChevronDown, ChevronUp,
  ListChecks, Wand2, RotateCcw,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { DocHeader } from '@/components/docs/DocHeader';
import { DocSidebar, DOC_SECTIONS } from '@/components/docs/DocSidebar';

const PROGRESS_STEPS = [
  { id: 'scanning', label: 'Scanning files' },
  { id: 'detecting', label: 'Detecting APIs' },
  { id: 'architecture', label: 'Understanding architecture' },
  { id: 'building', label: 'Building documentation' },
  { id: 'generating', label: 'Generating markdown files' },
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

const SECTION_TO_FILE: Record<string, string> = {
  readme: 'README.md',
  api: 'API.md',
  'endpoint-docs': 'API.md',
  architecture: 'ARCHITECTURE.md',
  setup: 'SETUP.md',
  auth: 'SECURITY.md',
  environment: 'ENVIRONMENT.md',
  database: 'ENVIRONMENT.md',
  deployment: 'DEPLOYMENT.md',
  'folder-structure': 'ARCHITECTURE.md',
  changelog: 'CHANGELOG.md',
};

function renderMarkdown(text: string): string {
  let html = text
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold text-white mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold text-white mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold text-white mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-white/[0.06] text-emerald-300 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="text-neutral-400 text-sm ml-4 list-disc">$1</li>')
    .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre class="bg-black/40 rounded-lg p-3 my-2 overflow-x-auto"><code class="text-xs text-emerald-300 font-mono">$2</code></pre>')
    .replace(/\n\n/g, '</p><p class="text-sm text-neutral-400 leading-relaxed mb-3">');
  html = '<p class="text-sm text-neutral-400 leading-relaxed mb-3">' + html + '</p>';
  html = html.replace(
    /<p class="text-sm text-neutral-400 leading-relaxed mb-3">(\|.+\|)<\/p>/g,
    (_, tableContent) => {
      const rows = tableContent.split('\n').filter((r: string) => r.trim().startsWith('|'));
      if (rows.length < 2) return tableContent;
      let table = '<div class="overflow-x-auto my-3"><table class="w-full text-xs border-collapse">';
      rows.forEach((row: string, i: number) => {
        const cells = row.split('|').filter(Boolean);
        if (cells.some((c: string) => c.trim().match(/^[-:]+\+?[-:]+$/))) return;
        const tag = i === 0 ? 'th' : 'td';
        table += '<tr>';
        cells.forEach((c: string) => {
          table += `<${tag} class="border border-white/[0.06] px-3 py-1.5 text-left ${tag === 'th' ? 'text-neutral-300 font-medium' : 'text-neutral-400'}">${c.trim()}</${tag}>`;
        });
        table += '</tr>';
      });
      table += '</table></div>';
      return table;
    }
  );
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
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function DocCard({ filename, content, isBeginner }: { filename: string; content: string; isBeginner: boolean }) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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
      ref={cardRef}
      id={`doc-${filename.replace(/\./g, '-')}`}
      className={`rounded-2xl border ${isReadme ? 'border-emerald-500/10' : 'border-white/[0.06]'} bg-[#090b10] overflow-hidden`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isReadme ? 'border-emerald-500/10' : 'border-white/[0.06]'}`}>
        <div className="flex items-center gap-2.5">
          {isReadme ? <BookOpen size={14} className="text-emerald-400" /> : <FileText size={14} className="text-neutral-400" />}
          <div>
            <span className={`text-sm font-medium ${isReadme ? 'text-emerald-300' : 'text-white'}`}>{label}</span>
            <span className="ml-2 text-[10px] text-neutral-600 font-mono">{filename}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-white/[0.04] text-neutral-500 hover:text-neutral-300 transition-colors" title="Copy markdown">
            {copied ? <span className="text-[10px] text-emerald-400">Copied!</span> : <Copy size={13} />}
          </button>
          <button type="button" onClick={handleDownload} className="p-1.5 rounded-lg hover:bg-white/[0.04] text-neutral-500 hover:text-neutral-300 transition-colors" title="Download .md">
            <Download size={13} />
          </button>
          <button type="button" onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-white/[0.04] text-neutral-500 hover:text-neutral-300 transition-colors">
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden"
          >
            <div className="p-4 max-h-[600px] overflow-y-auto">
              <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
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
    <motion.div className="rounded-2xl border border-amber-500/10 bg-[#090b10] overflow-hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
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
            <button type="button" onClick={() => onGenerateSection(md.type)} className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium whitespace-nowrap">
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
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState<{ id: string; label: string; done: boolean; current: boolean }[]>([]);
  const [generatedDocs, setGeneratedDocs] = useState<Record<string, string> | null>(null);
  const [sections, setSections] = useState<any>(null);
  const [missingDocs, setMissingDocs] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState('readme');
  const [isBeginner, setIsBeginner] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasData, setHasData] = useState<Record<string, boolean>>({});
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRepositories();
  }, []);

  useEffect(() => {
    if (selectedRepo) {
      setGeneratedDocs(null);
      setMissingDocs([]);
      setActiveSection('readme');
      setSections(null);
      setHasData({});
      fetchExistingDocs();
    }
  }, [selectedRepo]);

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (generatedDocs && activeSection && activeSection !== 'ai-suggestions') {
      const fileKey = SECTION_TO_FILE[activeSection];
      if (fileKey && generatedDocs[fileKey]) {
        setTimeout(() => {
          const el = document.getElementById(`doc-${fileKey.replace(/\./g, '-')}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      }
    }
  }, [activeSection, generatedDocs]);

  async function fetchRepositories() {
    try {
      const data = await api.repositories.list();
      setRepositories((data.repositories || []).map((r: any) => ({ id: r.id, name: r.name })));
    } catch {}
  }

  async function fetchExistingDocs() {
    if (!selectedRepo) return;
    setLoading(true);
    try {
      const data = await api.docs.get(selectedRepo);
      if (data?.sections) {
        setSections(data.sections);
        setHasData({
          readme: true, api: !!data.sections.apis?.routes?.length, setup: true,
          architecture: !!data.sections.architecture, changelog: true,
          'endpoint-docs': !!data.sections.apis?.routes?.length,
          environment: !!data.sections.environment, database: !!data.sections.database?.dbFiles?.length,
          auth: !!data.sections.auth?.flows?.length, deployment: !!data.sections.deployment?.deployFiles?.length,
          'folder-structure': !!data.sections.architecture?.directories?.length, 'ai-suggestions': false,
        });
      }
    } catch {} finally {
      setLoading(false);
    }
  }

  function runProgressAnimation() {
    const steps = PROGRESS_STEPS.map((s, i) => ({ ...s, done: false, current: i === 0 }));
    setProgress(steps);
    let index = 0;
    progressTimerRef.current = setInterval(() => {
      index++;
      if (index >= PROGRESS_STEPS.length) {
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        return;
      }
      setProgress((prev) => prev.map((p, i) => ({ ...p, done: i < index, current: i === index })));
    }, 1500);
  }

  async function handleGenerateDocs() {
    if (!selectedRepo || generating) return;
    setGenerating(true);
    setGeneratedDocs(null);
    setMissingDocs([]);
    runProgressAnimation();

    try {
      await new Promise((r) => setTimeout(r, 1000));
      const data = await api.docs.generate(selectedRepo);
      await new Promise((r) => setTimeout(r, 500));

      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setProgress(PROGRESS_STEPS.map((s) => ({ ...s, done: true, current: false })));

      setGeneratedDocs(data.docs || null);
      setMissingDocs(data.missingDocs || []);
      setSections(data.sections || null);

      if (data.sections) {
        setHasData({
          readme: true, api: !!data.sections.apis?.routes?.length, setup: true,
          architecture: !!data.sections.architecture, changelog: true,
          'endpoint-docs': !!data.sections.apis?.routes?.length,
          environment: !!data.sections.environment, database: !!data.sections.database?.dbFiles?.length,
          auth: !!data.sections.auth?.flows?.length, deployment: !!data.sections.deployment?.deployFiles?.length,
          'folder-structure': !!data.sections.architecture?.directories?.length,
          'ai-suggestions': (data.missingDocs?.length ?? 0) > 0,
        });
      }

      setActiveSection('readme');
    } catch (err: any) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setProgress(PROGRESS_STEPS.map((s) => ({ ...s, done: false, current: false })));
    } finally {
      setGenerating(false);
    }
  }

  async function handleSync() {
    if (!selectedRepo || syncing) return;
    setSyncing(true);
    try {
      await api.repositories.scan(selectedRepo);
      await handleGenerateDocs();
    } catch {} finally {
      setSyncing(false);
    }
  }

  function handleExportMarkdown() {
    if (!generatedDocs) return;
    Object.entries(generatedDocs).forEach(([filename, content]) => {
      downloadMarkdown(filename, content);
    });
  }

  function handleRepoChange(id: string) {
    if (id === selectedRepo) return;
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setSelectedRepo(id);
    setGenerating(false);
    setSyncing(false);
  }

  function handleGenerateSection(type: string) {
    const sectionMap: Record<string, string> = { architecture: 'architecture', api: 'endpoint-docs', auth: 'auth', database: 'database', environment: 'environment', deployment: 'deployment', components: 'architecture' };
    setActiveSection(sectionMap[type] || 'readme');
    if (workspaceRef.current) workspaceRef.current.scrollIntoView({ behavior: 'smooth' });
  }

  const allDocKeys = generatedDocs ? Object.keys(generatedDocs) : [];
  const hasAnyDocs = allDocKeys.length > 0;

  const filteredDocKeys = activeSection === 'ai-suggestions'
    ? []
    : activeSection && SECTION_TO_FILE[activeSection]
      ? allDocKeys.filter((k) => k === SECTION_TO_FILE[activeSection])
      : allDocKeys;

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
        <motion.div className="rounded-2xl border border-white/[0.06] bg-[#090b10] p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
                  {step.done ? <CheckCircle2 size={12} /> : step.current ? <Loader2 size={10} className="animate-spin" /> : <div className="h-1.5 w-1.5 rounded-full bg-neutral-600" />}
                </div>
                <span className={`text-xs transition-colors ${step.done ? 'text-neutral-300' : step.current ? 'text-white font-medium' : 'text-neutral-600'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 w-full bg-white/[0.04] rounded-full h-1 overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
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

    return (
      <div ref={workspaceRef} className="space-y-4">
        {missingDocs.length > 0 && (
          <MissingDocsCard missingDocs={missingDocs} onGenerateSection={handleGenerateSection} />
        )}

        {activeSection === 'ai-suggestions' ? (
          <div className="rounded-2xl border border-amber-500/10 bg-[#090b10] p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <Wand2 size={16} className="text-amber-400" />
              <h2 className="text-sm font-semibold text-white">AI Suggestions</h2>
            </div>
            {missingDocs.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-neutral-400 mb-3">AI detected {missingDocs.length} documentation gaps in your repository:</p>
                {missingDocs.map((md: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/[0.06] p-3">
                    <AlertTriangle size={12} className="text-amber-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-neutral-300">{md.message}</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Section: {md.type}</p>
                    </div>
                    <button type="button" onClick={() => handleGenerateSection(md.type)} className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded hover:bg-emerald-500/20 transition-colors whitespace-nowrap">
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
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={13} className="text-neutral-500" />
                <span className="text-xs text-neutral-500">
                  {filteredDocKeys.length > 0
                    ? `Showing ${filteredDocKeys.length} of ${allDocKeys.length} files`
                    : `${allDocKeys.length} files generated`}
                </span>
              </div>
            </div>
            {filteredDocKeys.length > 0 ? filteredDocKeys.map((filename) => (
              <DocCard key={filename} filename={filename} content={generatedDocs![filename]} isBeginner={isBeginner} />
            )) : allDocKeys.map((filename) => (
              <DocCard key={filename} filename={filename} content={generatedDocs![filename]} isBeginner={isBeginner} />
            ))}
          </div>
        )}
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
        onRegenerate={handleGenerateDocs}
        onExportMarkdown={handleExportMarkdown}
        onSync={handleSync}
        generating={generating}
        syncing={syncing}
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
