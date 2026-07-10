'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useVaultStore } from '@/lib/stores/vault-store';
import { AppSidebar } from '@/components/app-shell/app-sidebar';

export function AppShellClient({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const vaultId = useVaultStore(s => s.vaultId);
    const vaultKey = useVaultStore(s => s.vaultKey);
    const isUnlocked = Boolean(vaultId && vaultKey);

    useEffect(() => {
        if (!isUnlocked) {
            router.replace('/');
        }
    }, [isUnlocked, router]);

    if (!isUnlocked) {
        return null;
    }

    return (
        <div className="relative flex min-h-screen">
            <AppSidebar />
            <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-6">{children}</main>
        </div>
    );
}
