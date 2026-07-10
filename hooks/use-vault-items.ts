'use client';

import { useQuery } from '@tanstack/react-query';
import { useVaultStore } from '@/lib/stores/vault-store';
import { decryptItemPayload } from '@/lib/crypto/vault-crypto';
import type { EncryptedPasswordItemDTO, DecryptedPasswordItem } from '@/types/vault';

async function fetchItems(vaultId: string, trash: boolean): Promise<EncryptedPasswordItemDTO[]> {
    const res = await fetch(`/api/vaults/${vaultId}/items${trash ? '?trash=1' : ''}`);
    if (!res.ok) throw new Error('Gagal memuat item vault');
    return res.json();
}

export function useVaultItems(options?: { trash?: boolean }) {
    const vaultId = useVaultStore(s => s.vaultId);
    const vaultKey = useVaultStore(s => s.vaultKey);
    const trash = options?.trash ?? false;

    return useQuery({
        queryKey: ['vault-items', vaultId, trash],
        queryFn: async () => {
            if (!vaultId || !vaultKey) throw new Error('Vault terkunci');
            const encrypted = await fetchItems(vaultId, trash);

            const decrypted: DecryptedPasswordItem[] = await Promise.all(
                encrypted.map(async item => {
                    try {
                        const payload = await decryptItemPayload(
                            vaultKey,
                            item.nonce,
                            item.ciphertext,
                        );
                        return {
                            ...payload,
                            id: item.id,
                            vaultId: item.vaultId,
                            categoryId: item.categoryId,
                            createdAt: item.createdAt,
                            updatedAt: item.updatedAt,
                            passwordSetAt: item.passwordSetAt,
                            lastUsedAt: item.lastUsedAt,
                            isFavorite: item.isFavorite,
                            isDeleted: item.isDeleted,
                            decryptFailed: false,
                        };
                    } catch {
                        return {
                            website: '⚠ Item gagal didekripsi',
                            username: '',
                            password: '',
                            notes: '',
                            favorite: item.isFavorite,
                            customFields: [],
                            id: item.id,
                            vaultId: item.vaultId,
                            categoryId: item.categoryId,
                            createdAt: item.createdAt,
                            updatedAt: item.updatedAt,
                            passwordSetAt: item.passwordSetAt,
                            lastUsedAt: item.lastUsedAt,
                            isFavorite: item.isFavorite,
                            isDeleted: item.isDeleted,
                            decryptFailed: true,
                        };
                    }
                }),
            );

            return decrypted;
        },
        enabled: Boolean(vaultId && vaultKey),
        staleTime: 30_000,
    });
}
