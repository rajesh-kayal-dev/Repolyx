'use client';

import { Layers, Search, Sparkles, TerminalSquare, ArrowLeft } from 'lucide-react';

interface DebugHeaderProps {
    beginnerMode: boolean;
    onToggleMode: () => void;
    onScanAnother: () => void;
    showScanButton: boolean;
}

export function DebugHeader({
    beginnerMode,
    onToggleMode,
    onScanAnother,
    showScanButton,
}: DebugHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: Title + meta */}
            <div className="flex items-center gap-3">
                {showScanButton && (
                    <button
                        onClick={onScanAnother}
                        className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-neutral-400 hover:bg-white/[0.06] hover:text-white transition-all"
                        title="Back to Repositories"
                    >
                        <ArrowLeft size={16} />
                    </button>
                )}
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/10 ring-1 ring-amber-400/20">
                    <TerminalSquare size={16} className="text-amber-400" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold text-white">Debug Assistant</h1>
                    <div className="flex items-center gap-3 text-sm text-neutral-500 mt-0.5">
                        <span>AI-powered automated repository intelligence</span>
                    </div>
                </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2 flex-wrap">
                {/* Beginner / Developer mode toggle */}
                <div className="flex items-center rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5">
                    <button
                        type="button"
                        onClick={() => !beginnerMode && onToggleMode()}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                            beginnerMode
                                ? 'bg-accent/10 text-accent shadow-sm'
                                : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                    >
                        <Sparkles size={11} />
                        Beginner
                    </button>
                    <button
                        type="button"
                        onClick={() => beginnerMode && onToggleMode()}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                            !beginnerMode
                                ? 'bg-white/[0.06] text-neutral-200 shadow-sm'
                                : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                    >
                        <Layers size={11} />
                        Developer
                    </button>
                </div>

                {/* Scan another repo button */}
                {showScanButton && (
                    <button
                        type="button"
                        onClick={onScanAnother}
                        className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200 transition-colors"
                    >
                        <Search size={12} />
                        Scan Another Repo
                    </button>
                )}
            </div>
        </div>
    );
}
