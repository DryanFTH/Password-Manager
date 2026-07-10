'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useVaultStore } from '@/lib/stores/vault-store';
import type { VaultSummary } from '@/types/vault';

async function fetchVaults(): Promise<VaultSummary[]> {
    const res = await fetch('/api/vaults');
    if (!res.ok) throw new Error('Gagal memuat daftar vault');
    return res.json();
}

export function useVaultList() {
    return useQuery({
        queryKey: ['vaults'],
        queryFn: fetchVaults,
        staleTime: 30_000,
    });
}

interface CreateVaultPayload {
    name: string;
    salt: string;
    protectedVaultKeyNonce: string;
    protectedVaultKeyCiphertext: string;
}

export function useCreateVault() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateVaultPayload): Promise<VaultSummary> => {
            const res = await fetch('/api/vaults', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? 'Gagal membuat vault');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vaults'] });
        },
    });
}

export function useDeleteVault() {
    const vaultId = useVaultStore(s => s.vaultId);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            if (!vaultId) throw new Error('Vault terkunci');
            const res = await fetch(`/api/vaults/${vaultId}`, { method: 'DELETE' });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? 'Gagal menghapus vault');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vaults'] });
        },
    });
}