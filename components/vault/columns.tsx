'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Star, MoreHorizontal, Pencil, Copy, Trash2, RotateCcw } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PasswordCell } from '@/components/vault/password-cell';
import {
    useToggleFavorite,
    useDeletePasswordItem,
    useRestorePasswordItem,
} from '@/hooks/use-password-item-mutations';
import type { DecryptedCategory, DecryptedPasswordItem } from '@/types/vault';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface ColumnsOptions {
    categories: DecryptedCategory[];
    showTrash: boolean;
    onEdit: (item: DecryptedPasswordItem) => void;
}

function FavoriteCell({ item }: { item: DecryptedPasswordItem }) {
    const toggleFavorite = useToggleFavorite();

    return (
        <Button
            type="button"
            size="icon"
            className="size-7"
            onClick={() => toggleFavorite.mutate({ itemId: item.id, favorite: !item.isFavorite })}
            aria-label={item.isFavorite ? 'Batal favorit' : 'Favoritkan'}
        >
            <Star className="size-4" fill={item.isFavorite ? 'currentColor' : 'none'} />
        </Button>
    );
}

function ActionsCell({
    item,
    showTrash,
    onEdit,
}: {
    item: DecryptedPasswordItem;
    showTrash: boolean;
    onEdit: (item: DecryptedPasswordItem) => void;
}) {
    const deleteItem = useDeletePasswordItem();
    const restoreItem = useRestorePasswordItem();

    async function copyUsername() {
        if (!item.username) return;
        await navigator.clipboard.writeText(item.username);
    }

    function handleDelete() {
        if (showTrash) {
            if (
                window.confirm(`Hapus permanen "${item.website}"? Aksi ini tidak bisa dibatalkan.`)
            ) {
                deleteItem.mutate({ itemId: item.id, permanent: true });
            }
        } else {
            deleteItem.mutate({ itemId: item.id, permanent: false });
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button type="button" size="icon" className="size-7">
                    <MoreHorizontal className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {!showTrash && (
                    <>
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                            <Pencil className="mr-2 size-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={copyUsername}>
                            <Copy className="mr-2 size-4" />
                            Salin Username
                        </DropdownMenuItem>
                    </>
                )}
                {showTrash && (
                    <DropdownMenuItem onClick={() => restoreItem.mutate({ itemId: item.id })}>
                        <RotateCcw className="mr-2 size-4" />
                        Pulihkan
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                    <Trash2 className="mr-2 size-4" />
                    {showTrash ? 'Hapus Permanen' : 'Pindah ke Sampah'}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function buildColumns({
    categories,
    showTrash,
    onEdit,
}: ColumnsOptions): ColumnDef<DecryptedPasswordItem>[] {
    return [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={checked => table.toggleAllPageRowsSelected(Boolean(checked))}
                    aria-label="Pilih semua"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={checked => row.toggleSelected(Boolean(checked))}
                    aria-label="Pilih baris"
                />
            ),
            enableSorting: false,
        },
        {
            id: 'favorite',
            header: '',
            cell: ({ row }) => <FavoriteCell item={row.original} />,
            enableSorting: false,
        },
        {
            accessorKey: 'website',
            header: 'Website',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-base">{row.original.website}</span>
                    {row.original.decryptFailed && (
                        <span className="text-xs text-destructive">Gagal didekripsi</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'username',
            header: 'Username',
            cell: ({ row }) => <span className="text-sm">{row.original.username || '—'}</span>,
        },
        {
            id: 'password',
            header: 'Password',
            cell: ({ row }) => <PasswordCell password={row.original.password} />,
        },
        {
            id: 'category',
            header: 'Kategori',
            cell: ({ row }) => {
                const category = categories.find(c => c.id === row.original.categoryId);
                return category ? (
                    <Badge style={{ backgroundColor: category.color ?? 'var{--main}' }}>
                        {category.icon ? (
                            <div className={'flex size-4 items-center justify-center'}>
                                {category.icon}
                            </div>
                        ) : (
                            ''
                        )}
                        <span>{category.name}</span>
                    </Badge>
                ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                );
            },
        },
        {
            accessorKey: 'updatedAt',
            header: 'Diubah',
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(row.original.updatedAt), {
                        addSuffix: true,
                        locale: localeId,
                    })}
                </span>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <ActionsCell item={row.original} showTrash={showTrash} onEdit={onEdit} />
            ),
            enableSorting: false,
        },
    ];
}
