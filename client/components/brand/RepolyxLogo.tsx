interface RepolyxLogoProps {
    className?: string;
    iconOnly?: boolean;
    size?: number;
}

let logoIdCounter = 0;

export function RepolyxLogo({ className, iconOnly, size = 24 }: RepolyxLogoProps) {
    const gradientId = `repolyx-grad-${(++logoIdCounter).toString(16)}`;

    return (
        <div className={`flex items-center gap-2.5 ${className ?? ''} select-none`}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
                role="img"
                aria-label="Repolyx"
            >
                <rect width="24" height="24" rx="6" fill={`url(#${gradientId})`} />
                <rect x="4" y="4" width="16" height="16" rx="4" fill="rgba(255,255,255,0.08)" />
                <text x="7" y="17" fontSize="14" fontWeight="700" fill="white" fontFamily="system-ui">R</text>
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="24" y2="24">
                        <stop stopColor="#06b6d4" />
                        <stop offset="1" stopColor="#6366f1" />
                    </linearGradient>
                </defs>
            </svg>
            {!iconOnly && (
                <span className="text-base font-semibold tracking-tight text-white select-none">
                    Repolyx
                </span>
            )}
        </div>
    );
}
