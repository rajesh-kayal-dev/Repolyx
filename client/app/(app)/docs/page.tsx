import { DocsHeader } from '@/components/docs/DocsHeader';
import { DocsNav } from '@/components/docs/DocsNav';

export default function DocsPage() {
    return (
        <div className="space-y-8">
            <DocsHeader />

            <div className="grid gap-8 xl:grid-cols-[240px_1fr]">
                <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                    <DocsNav />
                </div>

                <div className="space-y-8">
                    <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-6">
                        <div className="text-center py-12">
                            <h2 className="text-sm font-semibold text-white mb-1">Documentation Workspace</h2>
                            <p className="text-xs text-neutral-500 max-w-md mx-auto">
                                Import and index a repository to generate AI-powered documentation for your project.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
