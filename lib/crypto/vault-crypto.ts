import { aesGcmDecrypt, aesGcmEncrypt, importAesKey, randomBytes } from '@/lib/crypto/webcrypto';
import type { CategoryPayload, PasswordItemPayload } from '@/types/vault';

interface DecryptVaultKeyParams {
    protectedVaultKeyNonce: string;
    protectedVaultKeyCiphertext: string;
    encKey: CryptoKey;
}

export async function decryptVaultKey({
    protectedVaultKeyNonce,
    protectedVaultKeyCiphertext,
    encKey,
}: DecryptVaultKeyParams): Promise<CryptoKey> {
    const rawVaultKey = await aesGcmDecrypt(
        encKey,
        protectedVaultKeyNonce,
        protectedVaultKeyCiphertext,
    );
    return importAesKey(rawVaultKey);
}

export async function createProtectedVaultKey(encKey: CryptoKey): Promise<{
    vaultKey: CryptoKey;
    protectedVaultKeyNonce: string;
    protectedVaultKeyCiphertext: string;
}> {
    const rawVaultKey = randomBytes(32);
    const { nonce, ciphertext } = await aesGcmEncrypt(encKey, rawVaultKey);
    const vaultKey = await importAesKey(rawVaultKey);
    return { vaultKey, protectedVaultKeyNonce: nonce, protectedVaultKeyCiphertext: ciphertext };
}

export async function encryptItemPayload(
    vaultKey: CryptoKey,
    payload: PasswordItemPayload,
): Promise<{ nonce: string; ciphertext: string }> {
    const json = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(json);
    return aesGcmEncrypt(vaultKey, bytes);
}

export async function decryptItemPayload(
    vaultKey: CryptoKey,
    nonce: string,
    ciphertext: string,
): Promise<PasswordItemPayload> {
    const bytes = await aesGcmDecrypt(vaultKey, nonce, ciphertext);
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as PasswordItemPayload;
}

export async function encryptCategoryPayload(
    vaultKey: CryptoKey,
    payload: CategoryPayload,
): Promise<{ nonce: string; ciphertext: string }> {
    const json = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(json);
    return aesGcmEncrypt(vaultKey, bytes);
}

export async function decryptCategoryPayload(
    vaultKey: CryptoKey,
    nonce: string,
    ciphertext: string,
): Promise<CategoryPayload> {
    const bytes = await aesGcmDecrypt(vaultKey, nonce, ciphertext);
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as CategoryPayload;
}
