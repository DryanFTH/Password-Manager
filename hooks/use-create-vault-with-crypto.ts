'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bufToBase64, randomBytes } from '@/lib/crypto/webcrypto';
import { deriveEncKeyFromMasterKey, deriveMasterKey } from '@/lib/crypto/argon';
import { createProtectedVaultKey } from '@/lib/crypto/vault-crypto';

interface CreateVaultParams {
    name: string;
    masterPassword: string;
    secretKey: string;
}

interface CreateVaultResult {
    vaultId: string;
    vaultName: string;
    vaultKey: CryptoKey;
}

const ARGON_MEMORY_COST = 19456;
const ARGON_TIME_COST = 2;
const ARGON_PARALLELISM = 1;

export function useCreateVaultWithCrypto() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            name,
            masterPassword,
            secretKey,
        }: CreateVaultParams): Promise<CreateVaultResult> => {
            const salt = randomBytes(16);
            const saltBase64 = bufToBase64(salt);

            const masterKeyBytes = await deriveMasterKey({
                masterPassword,
                secretKey,
                saltBase64,
                memoryCost: ARGON_MEMORY_COST,
                timeCost: ARGON_TIME_COST,
                parallelism: ARGON_PARALLELISM,
            });

            const encKey = await deriveEncKeyFromMasterKey(masterKeyBytes);
            const { vaultKey, protectedVaultKeyNonce, protectedVaultKeyCiphertext } =
                await createProtectedVaultKey(encKey);

            const res = await fetch('/api/vaults', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    salt: saltBase64,
                    protectedVaultKeyNonce,
                    protectedVaultKeyCiphertext,
                    argonMemoryCost: ARGON_MEMORY_COST,
                    argonTimeCost: ARGON_TIME_COST,
                    argonParallelism: ARGON_PARALLELISM,
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? 'Gagal membuat vault');
            }

            const created: { id: string; name: string } = await res.json();
            return { vaultId: created.id, vaultName: created.name, vaultKey };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vaults'] });
        },
    });
}
