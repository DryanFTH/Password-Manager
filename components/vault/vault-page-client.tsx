'use client';

import { useMemo, useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVaultItems } from '@/hooks/use-vault-items';
import { useCategories } from '@/hooks/use-categories';
import { VaultToolbar } from '@/components/vault/vault-toolbar';
import { VaultTable } from '@/components/vault/vault-table';
import { BulkActionsBar } from '@/components/vault/bulk-actions-bar';
import { AddEditPasswordDialog } from '@/components/vault/add-edit-password-dialog';
import { ImportExportDialog } from '@/components/vault/import-export-dialog';
import { EmptyState } from '@/components/vault/empty-state';
import type { DecryptedPasswordItem } from '@/types/vault';

export type SortKey = 'updatedAt' | 'website' | 'passwordSetAt';
export type CategoryFilterValue = string | 'all' | 'none';

export function VaultPageClient() {
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState<CategoryFilterValue>('all');
    const [favoriteOnly, setFavoriteOnly] = useState(false);
    const [showTrash, setShowTrash] = useState(false);
    const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const [dialogOpen, setDialogOpen] = useState(false);
    const [importExportOpen, setImportExportOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<DecryptedPasswordItem | null>(null);

    const itemsQuery = useVaultItems({ trash: showTrash });
    const categoriesQuery = useCategories();

    const filteredItems = useMemo(() => {
        const items = itemsQuery.data ?? [];
        const term = search.trim().toLowerCase();

        return items
            .filter(item => {
                if (favoriteOnly && !item.isFavorite) return false;
                if (categoryId === 'none' && item.categoryId) return false;
                if (categoryId !== 'all' && categoryId !== 'none' && item.categoryId !== categoryId)
                    return false;
                if (!term) return true;
                return (
                    item.website.toLowerCase().includes(term) ||
                    item.username.toLowerCase().includes(term) ||
                    (item.notes ?? '').toLowerCase().includes(term)
                );
            })
            .sort((a, b) => {
                if (sortKey === 'website') return a.website.localeCompare(b.website);
                if (sortKey === 'passwordSetAt')
                    return (
                        new Date(a.passwordSetAt).getTime() - new Date(b.passwordSetAt).getTime()
                    );
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            });
    }, [itemsQuery.data, search, favoriteOnly, categoryId, sortKey]);

    const selectedIds = Object.keys(rowSelection).filter(id => rowSelection[id]);

    function openCreateDialog() {
        setEditingItem(null);
        setDialogOpen(true);
    }

    function openEditDialog(item: DecryptedPasswordItem) {
        setEditingItem(item);
        setDialogOpen(true);
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-heading">Vault</h2>
                    <p className="text-sm text-muted-foreground">
                        {itemsQuery.isLoading
                            ? 'Mendekripsi item...'
                            : `${filteredItems.length} dari ${itemsQuery.data?.length ?? 0} password`}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="neutral"
                        onClick={() => setImportExportOpen(true)}
                    >
                        <Upload className="mr-2 size-4" />
                        Import/Export
                    </Button>
                    <Button type="button" onClick={openCreateDialog}>
                        <Plus className="mr-2 size-4" />
                        Tambah Password
                    </Button>
                </div>
            </div>

            <VaultToolbar
                search={search}
                onSearchChange={setSearch}
                categoryId={categoryId}
                onCategoryChange={setCategoryId}
                categories={categoriesQuery.data ?? []}
                favoriteOnly={favoriteOnly}
                onFavoriteOnlyChange={setFavoriteOnly}
                showTrash={showTrash}
                onShowTrashChange={value => {
                    setShowTrash(value);
                    setRowSelection({});
                }}
                sortKey={sortKey}
                onSortKeyChange={setSortKey}
            />

            {selectedIds.length > 0 && (
                <BulkActionsBar
                    selectedIds={selectedIds}
                    showTrash={showTrash}
                    onDone={() => setRowSelection({})}
                />
            )}

            {itemsQuery.isError ? (
                <p className="text-sm text-destructive">
                    Gagal memuat vault. Pastikan vault dalam keadaan terbuka lalu coba lagi.
                </p>
            ) : filteredItems.length === 0 && !itemsQuery.isLoading ? (
                <EmptyState showTrash={showTrash} onAdd={openCreateDialog} />
            ) : (
                <VaultTable
                    items={filteredItems}
                    categories={categoriesQuery.data ?? []}
                    isLoading={itemsQuery.isLoading}
                    showTrash={showTrash}
                    rowSelection={rowSelection}
                    onRowSelectionChange={setRowSelection}
                    onEdit={openEditDialog}
                />
            )}

            <AddEditPasswordDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                categories={categoriesQuery.data ?? []}
                editingItem={editingItem}
            />

            <ImportExportDialog open={importExportOpen} onOpenChange={setImportExportOpen} />
        </div>
    );
}
