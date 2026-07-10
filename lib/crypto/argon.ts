import { argon2id } from 'hash-wasm';
import { base64ToBuf } from '@/lib/crypto/webcrypto';

interface DeriveMasterKeyParams {
    masterPassword: string;
    secretKey: string;
    saltBase64: string;
    memoryCost: number;
    timeCost: number;
    parallelism: number;
}

export async function deriveMasterKey({
    masterPassword,
    secretKey,
    saltBase64,
    memoryCost,
    timeCost,
    parallelism,
}: DeriveMasterKeyParams): Promise<Uint8Array<ArrayBuffer>> {
    const combined = `${masterPassword}:${secretKey}`;
    const salt = base64ToBuf(saltBase64);

    const hash = await argon2id({
        password: combined,
        salt,
        memorySize: memoryCost,
        iterations: timeCost,
        parallelism,
        hashLength: 32,
        outputType: 'binary',
    });

    return new Uint8Array(hash as Uint8Array);
}

export async function deriveEncKeyFromMasterKey(
    masterKeyBytes: Uint8Array<ArrayBuffer>,
): Promise<CryptoKey> {
    const hkdfKey = await crypto.subtle.importKey('raw', masterKeyBytes, 'HKDF', false, [
        'deriveKey',
    ]);

    return crypto.subtle.deriveKey(
        {
            name: 'HKDF',
            hash: 'SHA-256',
            salt: new Uint8Array(0),
            info: new TextEncoder().encode('password-manager-enc-key-v1'),
        },
        hkdfKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt'],
    );
}
