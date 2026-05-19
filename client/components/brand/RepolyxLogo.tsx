import Image from 'next/image';

interface RepolyxLogoProps {
    className?: string;
    iconOnly?: boolean;
    size?: number;
}

export function RepolyxLogo({ className, iconOnly, size = 24 }: RepolyxLogoProps) {
    return (
        <div className={`flex items-center gap-2.5 ${className ?? ''} select-none`}>
            <Image
                src="/Repolyx.png"
                alt="Repolyx"
                width={size}
                height={size}
                className="shrink-0 object-contain rounded-md"
                priority
            />
            {!iconOnly && (
                <span className="text-base font-semibold tracking-tight text-white select-none">
                    Repolyx
                </span>
            )}
        </div>
    );
}
