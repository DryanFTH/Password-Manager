'use client';

import { Search, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CategoryFilter } from '@/components/vault/category-filter';
import type { DecryptedCategory } from '@/types/vault';
import type { SortKey, CategoryFilterValue } from '@/components/vault/vault-page-client';

interface VaultToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    categoryId: CategoryFilterValue;
    onCategoryChange: (value: CategoryFilterValue) => void;
    categories: DecryptedCategory[];
    favoriteOnly: boolean;
    onFavoriteOnlyChange: (value: boolean) => void;
    showTrash: boolean;
    onShowTrashChange: (value: boolean) => void;
    sortKey: SortKey;
    onSortKeyChange: (value: SortKey) => void;
}

export function VaultToolbar({
    search,
    onSearchChange,
    categoryId,
    onCategoryChange,
    categories,
    favoriteOnly,
    onFavoriteOnlyChange,
    showTrash,
    onShowTrashChange,
    sortKey,
    onSortKeyChange,
}: VaultToolbarProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-55 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    placeholder="Cari website, username, atau catatan..."
                    className="pl-9"
                />
            </div>

            <CategoryFilter
                categories={categories}
                value={categoryId}
                onChange={onCategoryChange}
            />

            <Button
                type="button"
                variant={favoriteOnly ? 'default' : 'neutral'}
                onClick={() => onFavoriteOnlyChange(!favoriteOnly)}
            >
                <Star className="mr-2 size-4" fill={favoriteOnly ? 'currentColor' : 'none'} />
                Favorit
            </Button>

            <Select value={sortKey} onValueChange={value => onSortKeyChange(value as SortKey)}>
                <SelectTrigger className="w-47.5">
                    <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="updatedAt">Terakhir diubah</SelectItem>
                    <SelectItem value="website">Nama website (A-Z)</SelectItem>
                    <SelectItem value="passwordSetAt">Password terlama diganti</SelectItem>
                </SelectContent>
            </Select>

            <Button
                type="button"
                variant={showTrash ? 'default' : 'neutral'}
                onClick={() => onShowTrashChange(!showTrash)}
            >
                {showTrash ? 'Lihat Vault' : 'Sampah'}
            </Button>
        </div>
    );
}
