'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useVaultStore } from '@/lib/stores/vault-store';
import { encryptItemPayload } from '@/lib/crypto/vault-crypto';
import type { PasswordItemFormValues } from '@/lib/validations/password-item';

async function postJSON(url: string, method: string, body: unknown) {
    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? 'Terjadi kesalahan');
    }
    return res.json();
}

export function useCreatePasswordItem() {
    const vaultId = useVaultStore(s => s.vaultId);
    const vaultKey = useVaultStore(s => s.vaultKey);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (values: PasswordItemFormValues) => {
            if (!vaultId || !vaultKey) throw new Error('Vault terkunci');
            const { categoryId, favorite, ...payload } = values;
            const { nonce, ciphertext } = await encryptItemPayload(vaultKey, {
                ...payload,
                favorite,
            });
            return postJSON(`/api/vaults/${vaultId}/items`, 'POST', {
                categoryId: categoryId ?? null,
                nonce,
                ciphertext,
                favorite,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vault-items', vaultId] });
        },
    });
}

export function useUpdatePasswordItem() {
    const vaultId = useVaultStore(s => s.vaultId);
    const vaultKey = useVaultStore(s => s.vaultKey);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            itemId,
            values,
            passwordChanged,
        }: {
            itemId: string;
            values: PasswordItemFormValues;
            passwordChanged: boolean;
        }) => {
            if (!vaultId || !vaultKey) throw new Error('Vault terkunci');
            const { categoryId, favorite, ...payload } = values;
            const { nonce, ciphertext } = await encryptItemPayload(vaultKey, {
                ...payload,
                favorite,
            });
            return postJSON(`/api/vaults/${vaultId}/items/${itemId}`, 'PATCH', {
                categoryId: categoryId ?? null,
                nonce,
                ciphertext,
                favorite,
                passwordChanged,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vault-items', vaultId] });
        },
    });
}

export function useToggleFavorite() {
    const vaultId = useVaultStore(s => s.vaultId);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ itemId, favorite }: { itemId: string; favorite: boolean }) => {
            if (!vaultId) throw new Error('Vault terkunci');
            return postJSON(`/api/vaults/${vaultId}/items/${itemId}`, 'PATCH', { favorite });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vault-items', vaultId] });
        },
    });
}

export function useRestorePasswordItem() {
    const vaultId = useVaultStore(s => s.vaultId);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ itemId }: { itemId: string }) => {
            if (!vaultId) throw new Error('Vault terkunci');
            return postJSON(`/api/vaults/${vaultId}/items/${itemId}`, 'PATCH', { restore: true });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vault-items', vaultId] });
        },
    });
}

export function useDeletePasswordItem() {
    const vaultId = useVaultStore(s => s.vaultId);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ itemId, permanent }: { itemId: string; permanent?: boolean }) => {
            if (!vaultId) throw new Error('Vault terkunci');
            const res = await fetch(
                `/api/vaults/${vaultId}/items/${itemId}${permanent ? '?permanent=1' : ''}`,
                { method: 'DELETE' },
            );
            if (!res.ok) throw new Error('Gagal menghapus item');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vault-items', vaultId] });
        },
    });
}

export function useBulkAction() {
    const vaultId = useVaultStore(s => s.vaultId);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            action,
            ids,
        }: {
            action: 'delete' | 'restore' | 'favorite' | 'unfavorite' | 'permanentDelete';
            ids: string[];
        }) => {
            if (!vaultId) throw new Error('Vault terkunci');
            return postJSON(`/api/vaults/${vaultId}/items/bulk`, 'POST', { action, ids });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vault-items', vaultId] });
        },
    });
}
