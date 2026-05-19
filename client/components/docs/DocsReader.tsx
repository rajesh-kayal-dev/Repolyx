import { Copy, FileText } from 'lucide-react';
import type { DocPreviewSection, EndpointDoc, ArchitectureInsight } from '@/lib/types';

interface DocsReaderProps {
    sections: DocPreviewSection[];
    apiDocs: EndpointDoc[];
    architecture: ArchitectureInsight[];
}

export function DocsReader({ sections, apiDocs, architecture }: DocsReaderProps) {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-base font-semibold text-white">README and API reference</h2>
                    <p className="text-sm text-neutral-500 mt-0.5">Generated from repository structure and interface contracts</p>
                </div>
                <button
                    type="button"
                    className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200 transition-colors flex items-center gap-1.5"
                >
                    <Copy size={12} />
                    Copy
                </button>
            </div>

            {/* Article content */}
            <div className="space-y-8">
                {sections.map((section) => (
                    <section key={section.title}>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[11px] font-medium text-accent uppercase tracking-wider">{section.tag}</span>
                            <span className="h-px flex-1 bg-white/[0.04]" />
                        </div>
                        <h3 className="text-base font-semibold text-white mb-2">{section.title}</h3>
                        <p className="text-sm text-neutral-300 leading-relaxed">{section.content}</p>
                        {section.code && (
                            <div className="mt-4 rounded-lg border border-white/[0.06] bg-[#05080d] overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.04]">
                                    <span className="text-[11px] text-neutral-500">{section.codeLabel || 'Code'}</span>
                                    <button
                                        type="button"
                                        className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors flex items-center gap-1"
                                    >
                                        <Copy size={11} /> Copy
                                    </button>
                                </div>
                                <pre className="px-4 py-3 text-xs font-mono text-neutral-200 overflow-x-auto leading-relaxed">{section.code}</pre>
                            </div>
                        )}
                    </section>
                ))}
            </div>

            {/* API endpoints */}
            <div className="mt-8">
                <h3 className="text-sm font-semibold text-white mb-3">API Endpoints</h3>
                <div className="rounded-lg border border-white/[0.06] divide-y divide-white/[0.04]">
                    {apiDocs.map((endpoint) => (
                        <div key={endpoint.route} className="flex items-center gap-4 px-4 py-3">
                            <span className="text-[11px] font-mono font-medium text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded shrink-0">
                                {endpoint.method}
                            </span>
                            <span className="text-sm font-mono text-neutral-200 flex-1">{endpoint.route}</span>
                            <span className="text-xs text-neutral-500 hidden sm:inline">{endpoint.summary}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Architecture */}
            <div className="mt-8">
                <h3 className="text-sm font-semibold text-white mb-3">Architecture</h3>
                <div className="space-y-3">
                    {architecture.map((item) => (
                        <div key={item.title} className="rounded-lg bg-white/[0.02] px-4 py-3">
                            <p className="text-sm font-medium text-neutral-200">{item.title}</p>
                            <p className="text-xs text-neutral-400 mt-1">{item.summary}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
