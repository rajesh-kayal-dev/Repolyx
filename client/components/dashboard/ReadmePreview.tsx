"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { BookOpen, ExternalLink, AlertCircle } from "lucide-react";
import { api } from "@/lib/api-client";

export function ReadmePreview() {
  const [readme, setReadme] = useState<string | null>(null);
  const [htmlUrl, setHtmlUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    api.dashboard.readme()
      .then((data) => { if (mounted) { setReadme(data.readme); setHtmlUrl(data.htmlUrl); } })
      .catch((err) => { if (mounted) setError(err.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#0d1117] p-6 min-h-[300px]">
        <div className="flex items-center gap-2 mb-5">
          <div className="h-4 w-4 bg-white/[0.04] rounded animate-pulse" />
          <div className="h-4 w-20 bg-white/[0.04] rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-3 bg-white/[0.04] rounded animate-pulse" style={{ width: `${55 + Math.random() * 45}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#0d1117] p-6">
        <div className="flex items-center gap-2 text-neutral-500 mb-4">
          <BookOpen size={15} />
          <span className="text-xs font-semibold uppercase tracking-wider">README</span>
        </div>
        <div className="flex items-start gap-2 text-sm text-red-400">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>Failed to load README: {error}</span>
        </div>
      </div>
    );
  }

  if (!readme) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#0d1117] p-6">
        <div className="flex items-center gap-2 text-neutral-500 mb-3">
          <BookOpen size={15} />
          <span className="text-xs font-semibold uppercase tracking-wider">README</span>
        </div>
        <p className="text-sm text-neutral-500">
          No profile README found. Create a{" "}
          <code className="text-neutral-400 bg-white/[0.04] px-1.5 py-0.5 rounded text-xs">{`{username}/{username}`}</code>{" "}
          repository to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0d1117]">
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-neutral-500">
          <BookOpen size={15} />
          <span className="text-xs font-semibold uppercase tracking-wider">README</span>
        </div>
        {htmlUrl && (
          <a
            href={htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <ExternalLink size={12} />
            View on GitHub
          </a>
        )}
      </div>
      <div className="p-6 max-h-[500px] overflow-y-auto markdown-body prose prose-invert prose-sm max-w-none
        prose-headings:text-white prose-headings:font-semibold prose-headings:mt-5 prose-headings:mb-2
        prose-h1:text-xl prose-h1:border-b prose-h1:border-white/[0.06] prose-h1:pb-2
        prose-h2:text-lg prose-h2:border-b prose-h2:border-white/[0.06] prose-h2:pb-1.5
        prose-h3:text-base
        prose-a:text-accent prose-a:no-underline hover:prose-a:underline
        prose-code:text-neutral-200 prose-code:bg-white/[0.06] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs
        prose-pre:bg-[#161b22] prose-pre:border prose-pre:border-white/[0.06] prose-pre:rounded-lg
        prose-img:rounded-lg prose-img:border prose-img:border-white/[0.06]
        prose-strong:text-white
        prose-blockquote:border-l-accent prose-blockquote:text-neutral-400 prose-blockquote:pl-4
        prose-table:border-collapse prose-table:w-full
        prose-th:border prose-th:border-white/[0.06] prose-th:px-3 prose-th:py-2 prose-th:text-xs
        prose-td:border prose-td:border-white/[0.06] prose-td:px-3 prose-td:py-2 prose-td:text-sm
        prose-hr:border-white/[0.06]
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {readme}
        </ReactMarkdown>
      </div>
    </div>
  );
}
