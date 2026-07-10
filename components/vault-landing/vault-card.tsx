'use client';

import { Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import type { VaultSummary } from '@/types/vault';

interface VaultCardProps {
    vault: VaultSummary;
    onSelect: () => void;
}

export function VaultCard({ vault, onSelect }: VaultCardProps) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className="flex items-center justify-between gap-3 border-2 border-border bg-background px-4 py-3 text-left transition-transform hover:-translate-y-0.5 hover:shadow-shadow"
        >
            <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center border-2 border-border bg-secondary-background">
                    <Lock className="size-4" />
                </div>
                <div>
                    <p className="font-base">{vault.name}</p>
                    <p className="text-xs text-muted-foreground">
                        Diubah{' '}
                        {formatDistanceToNow(new Date(vault.updatedAt), {
                            addSuffix: true,
                            locale: localeId,
                        })}
                    </p>
                </div>
            </div>
            <Button type="button" size="sm" variant="neutral" tabIndex={-1} asChild>
                <h1>Buka</h1>
            </Button>
        </button>
    );
}
