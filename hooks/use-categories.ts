'use client';

import { useQuery } from '@tanstack/react-query';
import { useVaultStore } from '@/lib/stores/vault-store';
import { decryptCategoryPayload } from '@/lib/crypto/vault-crypto';
import type { EncryptedCategoryDTO, DecryptedCategory } from '@/types/vault';

async function fetchCategories(vaultId: string): Promise<EncryptedCategoryDTO[]> {
    const res = await fetch(`/api/vaults/${vaultId}/categories`);
    if (!res.ok) throw new Error('Gagal memuat kategori');
    return res.json();
}

export function useCategories() {
    const vaultId = useVaultStore(s => s.vaultId);
    const vaultKey = useVaultStore(s => s.vaultKey);

    return useQuery({
        queryKey: ['vault-categories', vaultId],
        queryFn: async () => {
            if (!vaultId || !vaultKey) throw new Error('Vault terkunci');
            const encrypted = await fetchCategories(vaultId);

            const decrypted: DecryptedCategory[] = await Promise.all(
                encrypted.map(async cat => {
                    try {
                        const payload = await decryptCategoryPayload(
                            vaultKey,
                            cat.nonce,
                            cat.ciphertext,
                        );
                        return {
                            ...payload,
                            id: cat.id,
                            vaultId: cat.vaultId,
                            sortOrder: cat.sortOrder,
                        };
                    } catch {
                        return {
                            id: cat.id,
                            vaultId: cat.vaultId,
                            sortOrder: cat.sortOrder,
                            name: '⚠ Gagal dekripsi',
                        };
                    }
                }),
            );

            return decrypted.sort((a, b) => a.sortOrder - b.sortOrder);
        },
        enabled: Boolean(vaultId && vaultKey),
        staleTime: 60_000,
    });
}
