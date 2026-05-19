import type { ReactNode } from 'react';
import { PlatformShell } from '@/components/layout/PlatformShell';

export default function AppLayout({ children }: { children: ReactNode }) {
    return <PlatformShell>{children}</PlatformShell>;
}
