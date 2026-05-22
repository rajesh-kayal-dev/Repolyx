import type { ReactNode } from 'react';
import { PlatformShell } from '@/components/layout/PlatformShell';
import { ImportRepoProvider } from '@/lib/import-repo-context';

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <ImportRepoProvider>
            <PlatformShell>{children}</PlatformShell>
        </ImportRepoProvider>
    );
}
