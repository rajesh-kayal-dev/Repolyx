'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface MarkdownPreviewProps {
  content: string;
}

const components: Components = {
  h1: ({ children, ...props }) => (
    <h1 className="text-xl font-semibold text-white border-b border-white/[0.08] pb-2 mb-4 mt-6 first:mt-0" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-lg font-semibold text-white border-b border-white/[0.06] pb-1.5 mb-3 mt-5" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-base font-semibold text-white mb-2 mt-4" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="text-sm font-semibold text-neutral-200 mb-2 mt-3" {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, ...props }) => (
    <h5 className="text-sm font-medium text-neutral-300 mb-1.5 mt-3" {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, ...props }) => (
    <h6 className="text-xs font-medium text-neutral-400 mb-1.5 mt-3" {...props}>
      {children}
    </h6>
  ),
  p: ({ children, ...props }) => (
    <p className="text-sm text-neutral-300 leading-relaxed mb-4 last:mb-0" {...props}>
      {children}
    </p>
  ),
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent hover:underline"
      {...props}
    >
      {children}
    </a>
  ),
  ul: ({ children, ...props }) => (
    <ul className="text-sm text-neutral-300 space-y-1 mb-4 list-none" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal list-inside text-sm text-neutral-300 space-y-1 mb-4" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, className, ...props }) => {
    if (className?.includes('task-list-item')) {
      return (
        <li className="flex items-start gap-2 text-sm text-neutral-300 leading-relaxed mb-1" {...props}>
          {children}
        </li>
      );
    }
    return (
      <li className="text-sm text-neutral-300 leading-relaxed list-disc ml-5 mb-1" style={{ display: 'list-item' }} {...props}>
        {children}
      </li>
    );
  },
  code: ({ children, className, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          className="text-[12px] bg-white/[0.06] border border-white/[0.08] rounded px-1.5 py-0.5 text-accent font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <pre className="bg-[#0d1117] border border-white/[0.08] rounded-lg p-4 overflow-x-auto mb-4">
        <code className={`text-[13px] font-mono leading-relaxed text-neutral-300 ${className || ''}`} {...props}>
          {children}
        </code>
      </pre>
    );
  },
  pre: ({ children, ...props }) => <>{children}</>,
  blockquote: ({ children, ...props }) => (
    <blockquote className="border-l-2 border-accent/40 pl-4 py-1 my-4 text-sm text-neutral-400 italic" {...props}>
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto mb-4">
      <table className="min-w-full text-sm border-collapse border border-white/[0.08]" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-white/[0.03]" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th className="border border-white/[0.08] px-3 py-2 text-left text-xs font-semibold text-neutral-300" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border border-white/[0.08] px-3 py-2 text-xs text-neutral-400" {...props}>
      {children}
    </td>
  ),
  hr: ({ ...props }) => <hr className="border-white/[0.06] my-6" {...props} />,
  img: ({ src, alt, ...props }) => (
    <img src={src} alt={alt || ''} className="max-w-full rounded-lg my-4 border border-white/[0.06]" loading="lazy" referrerPolicy="no-referrer" {...props} />
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-white" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic text-neutral-200" {...props}>
      {children}
    </em>
  ),
  input: ({ type, checked, ...props }) => (
    <input
      type={type}
      checked={checked}
      readOnly
      className="mt-1 h-3.5 w-3.5 shrink-0 rounded-sm border border-white/30 accent-accent"
      {...props}
    />
  ),
  del: ({ children, ...props }) => (
    <del className="text-neutral-500 line-through" {...props}>
      {children}
    </del>
  ),
};

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
