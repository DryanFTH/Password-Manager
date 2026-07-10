'use client';

import { evaluatePasswordStrength } from '@/lib/utils/password-strength';

interface PasswordStrengthMeterProps {
    password: string;
}

const LABEL_COLOR: Record<string, string> = {
    Lemah: 'bg-red-500',
    Sedang: 'bg-yellow-500',
    Kuat: 'bg-blue-500',
    'Sangat Kuat': 'bg-green-500',
};

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
    if (!password) return null;

    const result = evaluatePasswordStrength(password);
    const percentage = ((result.score + 1) / 4) * 100;

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
                <span className="font-base">Kekuatan Password</span>
                <span className="font-base">{result.label}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-base border-2 border-border bg-secondary-background">
                <div
                    className={`h-full transition-all ${LABEL_COLOR[result.label]}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {result.feedback.length > 0 && (
                <ul className="list-inside list-disc text-xs text-muted-foreground">
                    {result.feedback.map(tip => (
                        <li key={tip}>{tip}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}
