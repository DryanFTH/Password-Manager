export interface PasswordGeneratorOptions {
    length: number;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
    excludeSimilar: boolean;
    excludeAmbiguous: boolean;
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{}<>?';
const SIMILAR_CHARS = 'il1Lo0O';
const AMBIGUOUS_CHARS = '{}[]()/\\\'"`~,;:.<>';

export function generatePassword(options: PasswordGeneratorOptions): string {
    let pool = '';
    if (options.uppercase) pool += UPPERCASE;
    if (options.lowercase) pool += LOWERCASE;
    if (options.numbers) pool += NUMBERS;
    if (options.symbols) pool += SYMBOLS;

    if (options.excludeSimilar) {
        pool = Array.from(pool)
            .filter(c => !SIMILAR_CHARS.includes(c))
            .join('');
    }
    if (options.excludeAmbiguous) {
        pool = Array.from(pool)
            .filter(c => !AMBIGUOUS_CHARS.includes(c))
            .join('');
    }

    if (pool.length === 0) {
        pool = LOWERCASE;
    }

    const randomValues = new Uint32Array(options.length);
    crypto.getRandomValues(randomValues);

    let result = '';
    for (let i = 0; i < options.length; i += 1) {
        result += pool[randomValues[i] % pool.length];
    }

    return result;
}
