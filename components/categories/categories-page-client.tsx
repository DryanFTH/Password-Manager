'use client';

import { useMemo, useState } from 'react';
import { Plus, Tags } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCategories } from '@/hooks/use-categories';
import { useVaultItems } from '@/hooks/use-vault-items';
import { useDeleteCategory, useReorderCategories } from '@/hooks/use-category-mutations';
import { CategoryRow } from '@/components/categories/category-row';
import { CategoryFormDialog } from '@/components/categories/category-form-dialog';
import type { DecryptedCategory } from '@/types/vault';

export function CategoriesPageClient() {
    const categoriesQuery = useCategories();
    const itemsQuery = useVaultItems({});
    const deleteCategory = useDeleteCategory();
    const reorderCategories = useReorderCategories();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<DecryptedCategory | null>(null);

    const itemCountByCategory = useMemo(() => {
        const counts = new Map<string, number>();
        for (const item of itemsQuery.data ?? []) {
            if (!item.categoryId) continue;
            counts.set(item.categoryId, (counts.get(item.categoryId) ?? 0) + 1);
        }
        return counts;
    }, [itemsQuery.data]);

    const categories = categoriesQuery.data ?? [];

    function openCreateDialog() {
        setEditingCategory(null);
        setDialogOpen(true);
    }

    function openEditDialog(category: DecryptedCategory) {
        setEditingCategory(category);
        setDialogOpen(true);
    }

    function handleMove(categoryId: string, direction: 'up' | 'down') {
        const index = categories.findIndex(c => c.id === categoryId);
        if (index === -1) return;
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= categories.length) return;

        const reordered = [...categories];
        [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
        reorderCategories.mutate({ orderedIds: reordered.map(c => c.id) });
    }

    function handleDelete(category: DecryptedCategory) {
        const count = itemCountByCategory.get(category.id) ?? 0;
        const message =
            count > 0
                ? `Hapus kategori "${category.name}"? ${count} password di kategori ini akan menjadi "Tanpa Kategori" (tidak ikut terhapus).`
                : `Hapus kategori "${category.name}"?`;

        if (window.confirm(message)) {
            deleteCategory.mutate({ categoryId: category.id });
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-heading">Categories</h2>
                    <p className="text-sm text-muted-foreground">
                        {categoriesQuery.isLoading
                            ? 'Memuat kategori...'
                            : `${categories.length} kategori`}
                    </p>
                </div>
                <Button type="button" onClick={openCreateDialog}>
                    <Plus className="mr-2 size-4" />
                    Tambah Kategori
                </Button>
            </div>

            {categoriesQuery.isError ? (
                <p className="text-sm text-destructive">Gagal memuat kategori. Coba lagi.</p>
            ) : categories.length === 0 && !categoriesQuery.isLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border py-16 text-center">
                    <Tags className="size-10 text-muted-foreground" />
                    <p className="font-base">Belum ada kategori</p>
                    <Button type="button" onClick={openCreateDialog}>
                        <Plus className="mr-2 size-4" />
                        Buat Kategori Pertama
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {categories.map((category, index) => (
                        <CategoryRow
                            key={category.id}
                            category={category}
                            itemCount={itemCountByCategory.get(category.id) ?? 0}
                            isFirst={index === 0}
                            isLast={index === categories.length - 1}
                            onMoveUp={() => handleMove(category.id, 'up')}
                            onMoveDown={() => handleMove(category.id, 'down')}
                            onEdit={() => openEditDialog(category)}
                            onDelete={() => handleDelete(category)}
                        />
                    ))}
                </div>
            )}

            <CategoryFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editingCategory={editingCategory}
            />
        </div>
    );
}
