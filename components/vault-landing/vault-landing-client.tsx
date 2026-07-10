'use client';

import { useState } from 'react';
import { Plus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVaultList } from '@/hooks/use-vaults';
import { VaultCard } from '@/components/vault-landing/vault-card';
import { UnlockVaultDialog } from '@/components/vault-landing/unlock-vault-dialog';
import { CreateVaultDialog } from '@/components/vault-landing/create-vault-dialog';
import type { VaultSummary } from '@/types/vault';

export function VaultLandingClient() {
    const vaultsQuery = useVaultList();
    const [selectedVault, setSelectedVault] = useState<VaultSummary | null>(null);
    const [createOpen, setCreateOpen] = useState(false);

    return (
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12">
            <div className="flex flex-col items-center gap-2 text-center">
                <ShieldCheck className="size-10" />
                <h1 className="text-2xl font-heading">Password Manager</h1>
                <p className="max-w-sm text-sm text-muted-foreground">
                    Zero-knowledge encryption — Master Password dan Secret Key kamu tidak pernah
                    meninggalkan browser ini.
                </p>
            </div>

            <div className="flex w-full max-w-md flex-col gap-3">
                {vaultsQuery.isLoading && (
                    <div className="h-16 w-full animate-pulse rounded-base border-2 border-border bg-secondary-background" />
                )}

                {vaultsQuery.isError && (
                    <p className="text-center text-sm text-destructive">
                        Gagal memuat daftar vault.
                    </p>
                )}

                {vaultsQuery.data?.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground">
                        Belum ada vault. Buat vault pertamamu untuk mulai menyimpan password.
                    </p>
                )}

                {vaultsQuery.data?.map(vault => (
                    <VaultCard
                        key={vault.id}
                        vault={vault}
                        onSelect={() => setSelectedVault(vault)}
                    />
                ))}

                <Button type="button" variant="neutral" onClick={() => setCreateOpen(true)}>
                    <Plus className="mr-2 size-4" />
                    Buat Vault Baru
                </Button>
            </div>

            <UnlockVaultDialog
                vault={selectedVault}
                open={Boolean(selectedVault)}
                onOpenChange={open => {
                    if (!open) setSelectedVault(null);
                }}
            />

            <CreateVaultDialog open={createOpen} onOpenChange={setCreateOpen} />
        </div>
    );
}
