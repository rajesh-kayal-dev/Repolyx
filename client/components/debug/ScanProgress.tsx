import { useEffect, useState } from 'react';
import { Search, Server, FileCode, Shield, GitCommit, PlayCircle, Loader2 } from 'lucide-react';

interface ScanProgressProps {
    repositoryName: string;
    scanState: 'scanning' | 'analyzing' | 'completed' | 'failed' | 'idle' | 'queued';
}

const STEPS = [
    { id: 'load', label: 'Loading repository files...', icon: Server, duration: 1500 },
    { id: 'env', label: 'Checking environment variables...', icon: FileCode, duration: 1200 },
    { id: 'deps', label: 'Analyzing dependencies...', icon: Search, duration: 1800 },
    { id: 'ts', label: 'Scanning for TypeScript issues...', icon: FileCode, duration: 2000 },
    { id: 'commits', label: 'Reviewing recent commits...', icon: GitCommit, duration: 1500 },
    { id: 'security', label: 'Running security patterns...', icon: Shield, duration: 2500 },
    { id: 'ai', label: 'Summarizing findings with AI...', icon: PlayCircle, duration: 3000 },
];

export function ScanProgress({ repositoryName, scanState }: ScanProgressProps) {
    const [activeStepIndex, setActiveStepIndex] = useState(0);

    useEffect(() => {
        let currentStep = activeStepIndex;
        let timeout: NodeJS.Timeout;

        // If analyzing (AI stage), jump to the last few steps
        if (scanState === 'analyzing') {
            currentStep = Math.max(currentStep, STEPS.length - 2);
            setActiveStepIndex(currentStep);
        }

        const runNextStep = () => {
            if (currentStep >= STEPS.length - 1 && scanState !== 'completed') {
                return; // Wait for backend to complete
            }
            if (scanState === 'completed') {
                setActiveStepIndex(STEPS.length);
                return;
            }

            timeout = setTimeout(() => {
                currentStep++;
                setActiveStepIndex(currentStep);
                runNextStep();
            }, STEPS[currentStep].duration);
        };

        runNextStep();

        return () => clearTimeout(timeout);
    }, [scanState]);

    const progress = Math.min(100, Math.round(((activeStepIndex) / STEPS.length) * 100));

    return (
        <div className="flex flex-col items-center justify-center py-24 max-w-lg mx-auto w-full">
            <div className="relative mb-8 flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-white/[0.04]" />
                <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
                <div className="absolute inset-0 rounded-full border-t-2 border-emerald-400/50 animate-[spin_2s_linear_infinite]" />
                <div className="absolute inset-0 rounded-full border-b-2 border-emerald-400/20 animate-[spin_3s_linear_infinite_reverse]" />
            </div>

            <h2 className="text-xl font-semibold text-white mb-2">Scanning {repositoryName}</h2>
            <p className="text-sm text-neutral-400 mb-10 text-center">
                The AI is analyzing your repository for misconfigurations, bugs, and security risks.
            </p>

            <div className="w-full space-y-4">
                {STEPS.map((step, index) => {
                    const isActive = index === activeStepIndex;
                    const isCompleted = index < activeStepIndex;
                    const isPending = index > activeStepIndex;
                    const Icon = step.icon;

                    return (
                        <div
                            key={step.id}
                            className={`flex items-center gap-4 text-sm transition-all duration-300 ${
                                isActive ? 'text-white translate-x-2' :
                                isCompleted ? 'text-neutral-500' : 'text-neutral-700'
                            }`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                isActive ? 'bg-white/[0.1] border border-white/[0.2]' :
                                isCompleted ? 'bg-emerald-400/10 text-emerald-400' : 'bg-white/[0.02]'
                            }`}>
                                {isCompleted ? (
                                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : (
                                    <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                                )}
                            </div>
                            <span className="font-medium">{step.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
