'use client';

import { ShieldOff, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    showTrash: boolean;
    onAdd: () => void;
}

export function EmptyState({ showTrash, onAdd }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border py-16 text-center">
            <ShieldOff className="size-10 text-muted-foreground" />
            <p className="font-base">
                {showTrash ? 'Sampah kosong' : 'Belum ada password di vault ini'}
            </p>
            {!showTrash && (
                <Button type="button" onClick={onAdd}>
                    <Plus className="mr-2 size-4" />
                    Tambah Password Pertama
                </Button>
            )}
        </div>
    );
}
