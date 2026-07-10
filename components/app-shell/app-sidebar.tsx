'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { KeyRound, Tags, LockKeyhole, ShieldCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeleteVault } from '@/hooks/use-vaults';
import { useVaultStore } from '@/lib/stores/vault-store';

const NAV_ITEMS = [
    { href: '/vault', label: 'Vault', icon: KeyRound },
    { href: '/categories', label: 'Categories', icon: Tags },
];

export function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const vaultName = useVaultStore(s => s.vaultName);
    const lock = useVaultStore(s => s.lock);
    const vaultId = useVaultStore(s => s.vaultId);
    const deleteVault = useDeleteVault();

    function handleLock() {
        lock();
        router.replace('/');
    }

    function handleDeleteVault() {
        if (!vaultId) return;
        if (
            !window.confirm(
                'Apakah Anda yakin ingin menghapus seluruh Vault? Aksi ini tidak dapat dibatalkan.',
            )
        ) {
            return;
        }
        deleteVault.mutate(undefined, {
            onSuccess: () => {
                lock();
                router.replace('/');
            },
            onError: error => {
                console.error('Delete vault failed:', error);
            },
        });
    }

    return (
        <aside className="relative flex w-64 shrink-0 flex-col justify-between border-r-2 border-border bg-secondary-background px-4 py-6">
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2 px-2">
                    <ShieldCheck className="size-6" />
                    <div>
                        <p className="text-xs text-muted-foreground">Vault Aktif</p>
                        <p className="truncate font-heading text-sm">{vaultName ?? 'Vault'}</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-1">
                    {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href || pathname?.startsWith(`${href}/`);
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-2.5 border-2 px-3 py-2 text-sm font-base transition-colors rounded-base ${
                                    isActive
                                        ? 'border-border bg-main text-main-foreground'
                                        : 'border-transparent hover:border-border hover:bg-secondary-background'
                                }`}
                            >
                                <Icon className="size-4" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="flex flex-col gap-2">
                {vaultId && (
                    <Button
                        type="button"
                        variant="destructive"
                        className="w-full mb-2"
                        onClick={handleDeleteVault}
                    >
                        <Trash2 className="mr-2 size-4" />
                        Delete Vault
                    </Button>
                )}
                <Button type="button" className="w-full" onClick={handleLock}>
                    <LockKeyhole className="mr-2 size-4" />
                    Kunci Vault
                </Button>
            </div>
        </aside>
    );
}
