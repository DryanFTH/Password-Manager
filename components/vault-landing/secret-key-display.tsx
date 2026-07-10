'use client';

import { useState } from 'react';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SecretKeyDisplayProps {
    value: string;
    onRegenerate: () => void;
}

export function SecretKeyDisplay({ value, onRegenerate }: SecretKeyDisplayProps) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // Pura pura ga liat :P
        }
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 break-all border-2 border-border bg-secondary-background px-3 py-2 font-mono text-sm">
                {value}
            </div>
            <Button
                type="button"
                variant="neutral"
                size="icon"
                onClick={handleCopy}
                aria-label="Salin Secret Key"
            >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
            <Button
                type="button"
                variant="neutral"
                size="icon"
                onClick={onRegenerate}
                aria-label="Generate ulang"
            >
                <RefreshCw className="size-4" />
            </Button>
        </div>
    );
}
