export async function checkPasswordPwned(password: string): Promise<number> {
    const buf = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest('SHA-1', buf);
    const hashHex = Array.from(new Uint8Array(digest))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();

    const prefix = hashHex.slice(0, 5);
    const suffix = hashHex.slice(5);

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!res.ok) {
        throw new Error('Gagal memeriksa breach database');
    }

    const text = await res.text();
    const match = text.split('\r\n').find(line => line.startsWith(suffix));
    return match ? parseInt(match.split(':')[1], 10) : 0;
}
