export interface PasswordStrengthResult {
    score: 0 | 1 | 2 | 3;
    label: 'Lemah' | 'Sedang' | 'Kuat' | 'Sangat Kuat';
    entropy: number;
    feedback: string[];
}

const COMMON_PASSWORDS = new Set([
    'password',
    '123456',
    '123456789',
    'qwerty',
    'admin',
    'letmein',
    'welcome',
    'monkey',
    'abc123',
    '111111',
    'iloveyou',
    'password1',
]);

const KEYBOARD_PATTERNS = ['qwerty', 'asdf', 'zxcv', '1234', 'qazwsx'];

function hasSequential(password: string): boolean {
    const lower = password.toLowerCase();
    for (let i = 0; i < lower.length - 2; i += 1) {
        const a = lower.charCodeAt(i);
        const b = lower.charCodeAt(i + 1);
        const c = lower.charCodeAt(i + 2);
        if (b === a + 1 && c === b + 1) return true;
        if (b === a - 1 && c === b - 1) return true;
    }
    return false;
}

function hasRepeated(password: string): boolean {
    return /(.)\1{2,}/.test(password);
}

function estimateEntropy(password: string): number {
    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;
    if (poolSize === 0) return 0;
    return Math.round(password.length * Math.log2(poolSize));
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
    const feedback: string[] = [];
    let score = 0;

    const length = password.length;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^a-zA-Z0-9]/.test(password);
    const entropy = estimateEntropy(password);
    const lower = password.toLowerCase();

    if (length >= 8) score += 1;
    if (length >= 12) score += 1;
    if (length < 8) feedback.push('Gunakan minimal 8 karakter, idealnya 12+');

    const variety = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;
    if (variety >= 3) score += 1;
    if (variety < 3) feedback.push('Kombinasikan huruf besar, kecil, angka, dan simbol');

    if (entropy >= 60) score += 1;

    if (hasRepeated(password)) {
        score = Math.max(0, score - 1);
        feedback.push('Hindari karakter berulang (mis. aaa, 111)');
    }

    if (hasSequential(password)) {
        score = Math.max(0, score - 1);
        feedback.push('Hindari karakter berurutan (mis. abc, 123)');
    }

    if (KEYBOARD_PATTERNS.some(pattern => lower.includes(pattern))) {
        score = Math.max(0, score - 1);
        feedback.push('Hindari pola keyboard (mis. qwerty, asdf)');
    }

    if (COMMON_PASSWORDS.has(lower)) {
        score = 0;
        feedback.push('Password ini termasuk kata sandi yang umum digunakan');
    }

    const clampedScore = Math.max(0, Math.min(3, score)) as 0 | 1 | 2 | 3;
    const labels: PasswordStrengthResult['label'][] = ['Lemah', 'Sedang', 'Kuat', 'Sangat Kuat'];

    return {
        score: clampedScore,
        label: labels[clampedScore],
        entropy,
        feedback,
    };
}
