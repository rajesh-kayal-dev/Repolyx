import { PRHeader } from '@/components/review/PRHeader';
import { FileChanges } from '@/components/review/FileChanges';
import { AISuggestions } from '@/components/review/AISuggestions';
import { ReviewSummary } from '@/components/review/ReviewSummary';
import { AIContext } from '@/components/review/AIContext';

export default function ReviewsPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <PRHeader
                title="Feature/refactor parser"
                branch="feature/refactor-parser"
                baseBranch="main"
                author="jordan"
                status="Open"
                mergeReady={78}
            />

            {/* 2-column layout */}
            <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
                {/* Left: review content */}
                <div className="space-y-8">
                    <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                        <FileChanges />
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                        <AISuggestions />
                    </div>
                </div>

                {/* Right: summary + context */}
                <div className="space-y-8">
                    <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                        <ReviewSummary />
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                        <AIContext />
                    </div>
                </div>
            </div>
        </div>
    );
}
