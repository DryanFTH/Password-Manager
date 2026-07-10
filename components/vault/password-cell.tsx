'use client';

import { useState } from 'react';
import { Copy, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PasswordCellProps {
    password: string;
    onCopy?: () => void;
}

export function PasswordCell({ password, onCopy }: PasswordCellProps) {
    const [revealed, setRevealed] = useState(false);
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(password);
            setCopied(true);
            onCopy?.();
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // Pura pura ga liat :P
        }
    }

    return (
        <div className="flex items-center gap-1.5">
            <span className="font-mono text-sm">
                {revealed ? password : '•'.repeat(Math.min(password.length || 8, 16))}
            </span>
            <Button
                type="button"
                size="icon"
                className="size-7"
                onClick={() => setRevealed(prev => !prev)}
                aria-label={revealed ? 'Sembunyikan password' : 'Tampilkan password'}
            >
                {revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </Button>
            <Button
                type="button"
                size="icon"
                className="size-7"
                onClick={handleCopy}
                aria-label="Salin password"
            >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            </Button>
        </div>
    );
}
