'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useVaultStore } from '@/lib/stores/vault-store';
import { encryptCategoryPayload } from '@/lib/crypto/vault-crypto';
import type { CategoryPayload } from '@/types/vault';

async function requestJSON(url: string, method: string, body?: unknown) {
    const res = await fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? 'Terjadi kesalahan');
    }
    return res.json();
}

export function useCreateCategory() {
    const vaultId = useVaultStore(s => s.vaultId);
    const vaultKey = useVaultStore(s => s.vaultKey);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CategoryPayload) => {
            if (!vaultId || !vaultKey) throw new Error('Vault terkunci');
            const { nonce, ciphertext } = await encryptCategoryPayload(vaultKey, payload);
            return requestJSON(`/api/vaults/${vaultId}/categories`, 'POST', { nonce, ciphertext });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vault-categories', vaultId] });
        },
    });
}

export function useUpdateCategory() {
    const vaultId = useVaultStore(s => s.vaultId);
    const vaultKey = useVaultStore(s => s.vaultKey);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            categoryId,
            payload,
        }: {
            categoryId: string;
            payload: CategoryPayload;
        }) => {
            if (!vaultId || !vaultKey) throw new Error('Vault terkunci');
            const { nonce, ciphertext } = await encryptCategoryPayload(vaultKey, payload);
            return requestJSON(`/api/vaults/${vaultId}/categories/${categoryId}`, 'PATCH', {
                nonce,
                ciphertext,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vault-categories', vaultId] });
        },
    });
}

export function useDeleteCategory() {
    const vaultId = useVaultStore(s => s.vaultId);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ categoryId }: { categoryId: string }) => {
            if (!vaultId) throw new Error('Vault terkunci');
            return requestJSON(`/api/vaults/${vaultId}/categories/${categoryId}`, 'DELETE');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vault-categories', vaultId] });
            queryClient.invalidateQueries({ queryKey: ['vault-items', vaultId] });
        },
    });
}

export function useReorderCategories() {
    const vaultId = useVaultStore(s => s.vaultId);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ orderedIds }: { orderedIds: string[] }) => {
            if (!vaultId) throw new Error('Vault terkunci');
            return requestJSON(`/api/vaults/${vaultId}/categories/reorder`, 'POST', { orderedIds });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vault-categories', vaultId] });
        },
    });
}
