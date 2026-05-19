'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, FileWarning } from 'lucide-react';
import { getLanguageFromFilename } from '@/lib/file-types';
import type { RepositoryFile } from '@/lib/types';
import { MarkdownPreview } from './MarkdownPreview';

interface CodeViewerProps {
  file: RepositoryFile;
  content: string | null;
  explanation: string | null;
  isLoading: boolean;
}

export function CodeViewer({ file, content, explanation, isLoading }: CodeViewerProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const [isHighlighting, setIsHighlighting] = useState(true);
  const [viewMode, setViewMode] = useState<'source' | 'preview'>('source');
  const scrollRef = useRef<HTMLDivElement>(null);

  const lang = getLanguageFromFilename(file.name);
  const isMarkdown = lang === 'markdown' || file.name.endsWith('.md') || file.name.endsWith('.mdx');
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(file.extension.replace('.', ''));
  const isLarge = (content?.length || 0) > 100000;
  const lineCount = content ? content.split('\n').length : 0;

  useEffect(() => {
    setHighlightedHtml(null);
    setIsHighlighting(true);
    setViewMode('source');
  }, [file.path]);

  useEffect(() => {
    if (!content || isImage || isLarge) {
      setIsHighlighting(false);
      return;
    }

    let cancelled = false;

    async function highlight() {
      try {
        const shiki = await import('shiki');
        const highlighter = await shiki.createHighlighter({
          themes: ['github-dark'],
          langs: [lang],
        });

        if (cancelled) return;

        const html = highlighter.codeToHtml(content as string, {
          lang,
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

    highlight();

    return () => { cancelled = true; };
  }, [content, lang, isImage, isLarge]);

  const handleCopy = useCallback(async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
    } catch {}
  }, [content]);

  const handleDownload = useCallback(() => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }, [content, file.name]);

  if (isImage) {
    return (
      <div className="rounded-lg border border-white/[0.06] bg-[#090d14] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-300">{file.path}</span>
            <span className="text-[10px] text-neutral-500 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
              {file.extension.replace('.', '').toUpperCase()}
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
    <div className="rounded-lg border border-white/[0.06] bg-[#090d14] overflow-hidden">
      <div className="sticky top-0 bg-[#090d14] z-10 border-b border-white/[0.04]">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-medium text-neutral-300 truncate max-w-[300px]">{file.path}</span>
            <span className="shrink-0 text-[10px] text-neutral-500 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
              {lang}
            </span>
            {isLarge && (
              <span className="shrink-0 text-[10px] text-amber-400/80 px-1.5 py-0.5 rounded bg-amber-400/5 border border-amber-400/10">
                Large file
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-neutral-500 mr-1">{lineCount} lines</span>

            {isMarkdown && (
              <div className="flex rounded-md border border-white/[0.06] overflow-hidden">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-2 py-1 text-[10px] font-medium transition-colors ${
                    viewMode === 'preview'
                      ? 'bg-accent/10 text-accent'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setViewMode('source')}
                  className={`px-2 py-1 text-[10px] font-medium transition-colors ${
                    viewMode === 'source'
                      ? 'bg-accent/10 text-accent'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Raw
                </button>
              </div>
            )}

            <button
              onClick={handleCopy}
              className="rounded px-2 py-1 text-[10px] text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04] transition-colors"
              title="Copy content"
            >
              Copy
            </button>
            <button
              onClick={handleDownload}
              className="rounded px-2 py-1 text-[10px] text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04] transition-colors"
              title="Download file"
            >
              Download
            </button>
          </div>
        </div>

        {explanation && (
          <div className="px-4 py-2 bg-white/[0.01] border-t border-white/[0.04] flex items-start gap-2">
            <span className="text-[10px] text-accent font-medium shrink-0 mt-0.5">AI</span>
            <p className="text-[11px] text-neutral-400 leading-relaxed">{explanation}</p>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="overflow-auto max-h-[calc(100vh-400px)]">
        {isLoading || isHighlighting ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Loader2 size={14} className="animate-spin" />
              {isHighlighting ? 'Highlighting syntax...' : 'Loading file...'}
            </div>
          </div>
        ) : content === null ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-xs text-neutral-600">Failed to load file content</p>
          </div>
        ) : isMarkdown && viewMode === 'preview' ? (
          <div className="p-6">
            <MarkdownPreview content={content} />
          </div>
        ) : highlightedHtml ? (
          <div
            className="text-[13px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace",
              fontSize: '13px',
              lineHeight: '1.6',
            }}
          />
        ) : (
          <pre
            className="p-4 overflow-x-auto"
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
