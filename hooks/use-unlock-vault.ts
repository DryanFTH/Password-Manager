'use client';

import { useMutation } from '@tanstack/react-query';
import { deriveEncKeyFromMasterKey, deriveMasterKey } from '@/lib/crypto/argon';
import { decryptVaultKey } from '@/lib/crypto/vault-crypto';
import type { VaultUnlockMaterial } from '@/types/vault';

interface UnlockVaultParams {
    vaultId: string;
    masterPassword: string;
    secretKey: string;
}

interface UnlockVaultResult {
    vaultId: string;
    vaultName: string;
    vaultKey: CryptoKey;
}

async function fetchVaultMaterial(vaultId: string): Promise<VaultUnlockMaterial> {
    const res = await fetch(`/api/vaults/${vaultId}`);
    if (!res.ok) throw new Error('Vault tidak ditemukan');
    return res.json();
}

export function useUnlockVault() {
    return useMutation({
        mutationFn: async ({
            vaultId,
            masterPassword,
            secretKey,
        }: UnlockVaultParams): Promise<UnlockVaultResult> => {
            const material = await fetchVaultMaterial(vaultId);

            const masterKeyBytes = await deriveMasterKey({
                masterPassword,
                secretKey,
                saltBase64: material.salt,
                memoryCost: material.argonMemoryCost,
                timeCost: material.argonTimeCost,
                parallelism: material.argonParallelism,
            });

            const encKey = await deriveEncKeyFromMasterKey(masterKeyBytes);

            try {
                const vaultKey = await decryptVaultKey({
                    protectedVaultKeyNonce: material.protectedVaultKeyNonce,
                    protectedVaultKeyCiphertext: material.protectedVaultKeyCiphertext,
                    encKey,
                });
                return { vaultId: material.id, vaultName: material.name, vaultKey };
            } catch {
                throw new Error('Master Password atau Secret Key salah');
            }
        },
    });
}
