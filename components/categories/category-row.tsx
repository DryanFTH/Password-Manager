"use client";

import { ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DecryptedCategory } from "@/types/vault";

interface CategoryRowProps {
  category: DecryptedCategory;
  itemCount: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function CategoryRow({
  category,
  itemCount,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: CategoryRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-2 border-border bg-background px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <Button
            type="button"
            variant="neutral"
            size="icon"
            className="size-5"
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label="Pindah ke atas"
          >
            <ChevronUp className="size-3" />
          </Button>
          <Button
            type="button"
            variant="neutral"
            size="icon"
            className="size-5"
            onClick={onMoveDown}
            disabled={isLast}
            aria-label="Pindah ke bawah"
          >
            <ChevronDown className="size-3" />
          </Button>
        </div>

        <div
          className="flex size-9 items-center justify-center rounded-full border-2 border-border text-base"
          style={{ backgroundColor: category.color ?? "#64748b" }}
        >
          {category.icon || ""}
        </div>

        <div>
          <p className="font-base">{category.name}</p>
          <p className="text-xs text-muted-foreground">
            {itemCount} password{itemCount === 1 ? "" : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="neutral">{itemCount}</Badge>
        <Button type="button" variant="neutral" size="icon" onClick={onEdit} aria-label="Edit kategori">
          <Pencil className="size-4" />
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={onDelete}
          aria-label="Hapus kategori"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
