export function bufToBase64(buf: ArrayBuffer | Uint8Array): string {
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export function base64ToBuf(base64: string): Uint8Array<ArrayBuffer> {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

export function randomBytes(length: number): Uint8Array<ArrayBuffer> {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
}

export async function aesGcmEncrypt(
    key: CryptoKey,
    plaintext: Uint8Array<ArrayBuffer>,
): Promise<{ nonce: string; ciphertext: string }> {
    const iv = randomBytes(12);
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
    return {
        nonce: bufToBase64(iv),
        ciphertext: bufToBase64(encrypted),
    };
}

export async function aesGcmDecrypt(
    key: CryptoKey,
    nonceBase64: string,
    ciphertextBase64: string,
): Promise<Uint8Array<ArrayBuffer>> {
    const iv = base64ToBuf(nonceBase64);
    const ciphertext = base64ToBuf(ciphertextBase64);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    return new Uint8Array(decrypted);
}

export async function importAesKey(rawBytes: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
    return crypto.subtle.importKey('raw', rawBytes, 'AES-GCM', false, ['encrypt', 'decrypt']);
}
