'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { DecryptedCategory } from '@/types/vault';
import type { CategoryFilterValue } from '@/components/vault/vault-page-client';

interface CategoryFilterProps {
    categories: DecryptedCategory[];
    value: CategoryFilterValue;
    onChange: (value: CategoryFilterValue) => void;
}

export function CategoryFilter({ categories, value, onChange }: CategoryFilterProps) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-45">
                <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="none">Tanpa Kategori</SelectItem>
                {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                        {category.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
