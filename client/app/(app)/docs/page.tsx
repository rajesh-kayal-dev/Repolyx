import { DocsHeader } from '@/components/docs/DocsHeader';
import { DocsNav } from '@/components/docs/DocsNav';
import { DocsReader } from '@/components/docs/DocsReader';
import { DocsAI } from '@/components/docs/DocsAI';
import { generatedDocSections, docEndpoints, architectureInsights } from '@/lib/mock-data';

export default function DocsPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <DocsHeader />

            {/* 2-column layout */}
            <div className="grid gap-8 xl:grid-cols-[240px_1fr]">
                {/* Left: navigation */}
                <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                    <DocsNav />
                </div>

                {/* Right: reader + AI */}
                <div className="space-y-8">
                    <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-6">
                        <DocsReader
                            sections={generatedDocSections}
                            apiDocs={docEndpoints}
                            architecture={architectureInsights}
                        />
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                        <DocsAI />
                    </div>
                </div>
            </div>
        </div>
    );
}
