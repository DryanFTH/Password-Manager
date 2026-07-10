'use client';

import { useRef, useState } from 'react';
import { Download, Upload, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useVaultStore } from '@/lib/stores/vault-store';
import { useQueryClient } from '@tanstack/react-query';
import type { EncryptedPasswordItemDTO } from '@/types/vault';

interface ImportExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ImportExportDialog({ open, onOpenChange }: ImportExportDialogProps) {
    const vaultId = useVaultStore(s => s.vaultId);
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    async function handleExport() {
        if (!vaultId) return;
        setBusy(true);
        setMessage(null);
        try {
            const res = await fetch(`/api/vaults/${vaultId}/items`);
            if (!res.ok) throw new Error('Gagal mengambil data vault');
            const items: EncryptedPasswordItemDTO[] = await res.json();

            const blob = new Blob(
                [JSON.stringify({ vaultId, exportedAt: new Date().toISOString(), items }, null, 2)],
                { type: 'application/json' },
            );
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vault-export-${vaultId}-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            setMessage(`Berhasil mengekspor ${items.length} item terenkripsi.`);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Gagal mengekspor vault');
        } finally {
            setBusy(false);
        }
    }

    async function handleImportFile(file: File) {
        if (!vaultId) return;
        setBusy(true);
        setMessage(null);
        try {
            const text = await file.text();
            const parsed = JSON.parse(text) as { items?: EncryptedPasswordItemDTO[] };
            const items = parsed.items ?? [];

            let success = 0;
            for (const item of items) {
                const res = await fetch(`/api/vaults/${vaultId}/items`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        categoryId: item.categoryId,
                        nonce: item.nonce,
                        ciphertext: item.ciphertext,
                        favorite: item.isFavorite,
                    }),
                });
                if (res.ok) success += 1;
            }

            queryClient.invalidateQueries({ queryKey: ['vault-items', vaultId] });
            setMessage(`Berhasil mengimpor ${success} dari ${items.length} item.`);
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : 'File tidak valid. Pastikan file adalah hasil export dari vault yang sama.',
            );
        } finally {
            setBusy(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Import / Export Vault</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground">
                        Export menghasilkan file JSON yang isinya <strong>tetap terenkripsi</strong>{' '}
                        (nonce + ciphertext). File ini hanya bisa diimpor kembali ke vault yang
                        sama, karena butuh Vault Key identik untuk didekripsi.
                    </p>

                    <Button type="button" onClick={handleExport} disabled={busy}>
                        {busy ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 size-4" />
                        )}
                        Export Vault (JSON Terenkripsi)
                    </Button>

                    <Button
                        type="button"
                        variant="neutral"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={busy}
                    >
                        <Upload className="mr-2 size-4" />
                        Import dari File JSON
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/json"
                        className="hidden"
                        onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleImportFile(file);
                            e.target.value = '';
                        }}
                    />

                    {message && <p className="text-sm">{message}</p>}
                </div>
            </DialogContent>
        </Dialog>
    );
}
