'use client';

import { Star, StarOff, Trash2, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBulkAction } from '@/hooks/use-password-item-mutations';

interface BulkActionsBarProps {
    selectedIds: string[];
    showTrash: boolean;
    onDone: () => void;
}

export function BulkActionsBar({ selectedIds, showTrash, onDone }: BulkActionsBarProps) {
    const bulkAction = useBulkAction();

    function run(action: 'delete' | 'restore' | 'favorite' | 'unfavorite' | 'permanentDelete') {
        bulkAction.mutate({ action, ids: selectedIds }, { onSuccess: onDone });
    }

    function runPermanentDelete() {
        if (
            window.confirm(
                `Hapus permanen ${selectedIds.length} item? Aksi ini tidak bisa dibatalkan.`,
            )
        ) {
            run('permanentDelete');
        }
    }

    return (
        <div className="flex items-center justify-between gap-3 border-2 border-border bg-secondary-background px-4 py-3">
            <p className="text-sm font-base">{selectedIds.length} item dipilih</p>
            <div className="flex gap-2">
                {showTrash ? (
                    <>
                        <Button
                            type="button"
                            size="sm"
                            variant="neutral"
                            onClick={() => run('restore')}
                            disabled={bulkAction.isPending}
                        >
                            <RotateCcw className="mr-2 size-4" />
                            Pulihkan
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={runPermanentDelete}
                            disabled={bulkAction.isPending}
                        >
                            <Trash2 className="mr-2 size-4" />
                            Hapus Permanen
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            type="button"
                            size="sm"
                            variant="neutral"
                            onClick={() => run('favorite')}
                            disabled={bulkAction.isPending}
                        >
                            <Star className="mr-2 size-4" />
                            Favoritkan
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="neutral"
                            onClick={() => run('unfavorite')}
                            disabled={bulkAction.isPending}
                        >
                            <StarOff className="mr-2 size-4" />
                            Batal Favorit
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => run('delete')}
                            disabled={bulkAction.isPending}
                        >
                            <Trash2 className="mr-2 size-4" />
                            Pindah ke Sampah
                        </Button>
                    </>
                )}
                <Button type="button" size="sm" variant="neutral" onClick={onDone}>
                    <X className="size-4" />
                </Button>
            </div>
        </div>
    );
}
