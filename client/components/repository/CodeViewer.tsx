'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Loader2,
  Copy,
  Check,
  Download,
  FileWarning,
  Eye,
  Code2,
} from 'lucide-react';
import { getLanguageFromFilename } from '@/lib/file-types';
import type { RepositoryFile } from '@/lib/types';
import { MarkdownPreview } from './MarkdownPreview';
import { showToast } from '@/lib/use-toast';

interface CodeViewerProps {
  file: RepositoryFile;
  content: string | null;
  explanation: string | null;
  isLoading: boolean;
}

let highlighterInstance: any = null;
let highlighterPromise: Promise<any> | null = null;

const BASE_LANGS = [
  'javascript', 'typescript', 'jsx', 'tsx', 'html', 'css',
  'python', 'go', 'rust', 'java', 'json', 'yaml', 'markdown',
  'bash', 'sql', 'xml', 'ruby', 'php', 'c', 'cpp', 'csharp',
  'text',
];

async function getHighlighter() {
  if (highlighterInstance) return highlighterInstance;
  if (highlighterPromise) return highlighterPromise;

  highlighterPromise = (async () => {
    const shiki = await import('shiki');
    try {
      const highlighter = await shiki.createHighlighter({
        themes: ['github-dark'],
        langs: BASE_LANGS,
      });
      highlighterInstance = highlighter;
      return highlighter;
    } catch {
      highlighterInstance = null;
      return null;
    }
  })();

  return highlighterPromise;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0);
  return `${size} ${units[i]}`;
}

function getLineCount(content: string | null): number {
  if (!content) return 0;
  let count = 0;
  let i = 0;
  while (i < content.length) {
    if (content[i] === '\n' || (content[i] === '\r' && content[i + 1] === '\n')) {
      count++;
      if (content[i] === '\r') i++;
    }
    i++;
  }
  if (content.length > 0 && content[content.length - 1] !== '\n') count++;
  return count;
}

export function CodeViewer({ file, content, explanation, isLoading }: CodeViewerProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const [isHighlighting, setIsHighlighting] = useState(true);
  const [viewMode, setViewMode] = useState<'source' | 'preview'>('source');
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const lang = getLanguageFromFilename(file.name);
  const isMarkdown = lang === 'markdown' || file.name.endsWith('.md') || file.name.endsWith('.mdx');
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(file.extension.replace('.', ''));
  const isLarge = (content?.length || 0) > 50000;
  const lineCount = getLineCount(content);

  useEffect(() => {
    setHighlightedHtml(null);
    setIsHighlighting(true);
    setViewMode('source');
    setCopied(false);
  }, [file.path]);

  useEffect(() => {
    if (!content || isImage || isLarge) {
      setIsHighlighting(false);
      return;
    }

    let cancelled = false;

    async function highlight() {
      try {
        const highlighter = await getHighlighter();

        if (cancelled || !highlighter) {
          if (!cancelled) setIsHighlighting(false);
          return;
        }

        try {
          const html = highlighter.codeToHtml(content as string, {
            lang: lang,
            theme: 'github-dark',
          });
          if (!cancelled) {
            setHighlightedHtml(html);
            setIsHighlighting(false);
          }
        } catch {
          try {
            const html = highlighter.codeToHtml(content as string, {
              lang: 'text',
              theme: 'github-dark',
            });
            if (!cancelled) {
              setHighlightedHtml(html);
              setIsHighlighting(false);
            }
          } catch {
            if (!cancelled) {
              setHighlightedHtml(null);
              setIsHighlighting(false);
            }
          }
        }
      } catch {
        if (!cancelled) {
          setHighlightedHtml(null);
          setIsHighlighting(false);
        }
      }
    }

    highlight();

    return () => { cancelled = true; };
  }, [content, lang, isImage, isLarge]);

  const handleCopy = useCallback(async () => {
    if (!content) return;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(content);
      } else {
        const ta = document.createElement('textarea');
        ta.value = content;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      showToast('Copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy', 'error');
    }
  }, [content]);

  const handleDownload = useCallback(() => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('File downloaded', 'success');
  }, [content, file.name]);

  if (isImage) {
    return (
      <div className="rounded-lg border border-white/[0.06] bg-[#090d14] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-300">{file.path}</span>
            <span className="text-[10px] text-neutral-500 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] uppercase">
              {file.extension.replace('.', '')}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center p-8 bg-white/[0.01]">
          <FileWarning size={24} className="text-neutral-600" />
          <span className="text-xs text-neutral-500 ml-2">Binary file — cannot display in viewer</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#0d1117] overflow-hidden">
      <div className="sticky top-0 z-20 bg-[#0d1117] border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xs font-medium text-neutral-200 truncate max-w-[280px]">{file.path}</span>
            <span className="shrink-0 text-[10px] font-medium text-neutral-400 px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08]">
              {lang}
            </span>
            <span className="shrink-0 text-[10px] text-neutral-500">
              {formatFileSize(file.size)}
            </span>
            {isLarge && (
              <span className="shrink-0 text-[10px] font-medium text-amber-400/90 px-2 py-0.5 rounded-md bg-amber-400/8 border border-amber-400/15">
                Large file
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-neutral-500 mr-1.5 tabular-nums">
              {lineCount} {lineCount === 1 ? 'line' : 'lines'}
            </span>

            {isMarkdown && (
              <div className="flex rounded-md border border-white/[0.08] overflow-hidden mr-1">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition-colors ${
                    viewMode === 'preview'
                      ? 'bg-accent/10 text-accent'
                      : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <Eye size={11} />
                  Preview
                </button>
                <button
                  onClick={() => setViewMode('source')}
                  className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition-colors ${
                    viewMode === 'source'
                      ? 'bg-accent/10 text-accent'
                      : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <Code2 size={11} />
                  Raw
                </button>
              </div>
            )}

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.05] transition-colors"
              title="Copy content"
            >
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.05] transition-colors"
              title="Download file"
            >
              <Download size={11} />
              Download
            </button>
          </div>
        </div>

        {explanation && (
          <div className="px-4 py-2 bg-accent/[0.03] border-t border-white/[0.04] flex items-start gap-2">
            <span className="text-[10px] font-semibold text-accent shrink-0 mt-0.5 uppercase tracking-wider">AI</span>
            <p className="text-[11px] text-neutral-400 leading-relaxed">{explanation}</p>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="overflow-auto max-h-[calc(100vh-380px)] scroll-smooth">
        {isLoading || isHighlighting ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Loader2 size={14} className="animate-spin" />
              {isHighlighting ? 'Highlighting syntax...' : 'Loading file...'}
            </div>
          </div>
        ) : content === null ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-2">
              <FileWarning size={20} className="text-neutral-600" />
              <p className="text-xs text-neutral-600">Failed to load file content</p>
            </div>
          </div>
        ) : isMarkdown && viewMode === 'preview' ? (
          <div className="p-6">
            <MarkdownPreview content={content} />
          </div>
        ) : isLarge ? (
          <pre
            className="overflow-x-auto"
            style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace",
              fontSize: '13px',
              lineHeight: '1.6',
            }}
          >
            <code className="text-neutral-300 whitespace-pre">{content}</code>
          </pre>
        ) : highlightedHtml ? (
          <div
            className="shiki-code-wrapper"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <pre
            className="overflow-x-auto"
            style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace",
              fontSize: '13px',
              lineHeight: '1.6',
            }}
          >
            <code className="text-neutral-300 whitespace-pre">{content}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
