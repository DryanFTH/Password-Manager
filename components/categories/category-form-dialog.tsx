"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCreateCategory, useUpdateCategory } from "@/hooks/use-category-mutations";
import type { DecryptedCategory } from "@/types/vault";

const COLOR_PRESETS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899", "#64748b",
];

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCategory: DecryptedCategory | null;
}

export function CategoryFormDialog({ open, onOpenChange, editingCategory }: CategoryFormDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(COLOR_PRESETS[0]);
  const [icon, setIcon] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const isEditing = Boolean(editingCategory);
  const isPending = createCategory.isPending || updateCategory.isPending;

  useEffect(() => {
    if (open) {
      setName(editingCategory?.name ?? "");
      setColor(editingCategory?.color ?? COLOR_PRESETS[0]);
      setIcon(editingCategory?.icon ?? "");
      setError(null);
    }
  }, [open, editingCategory]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Nama kategori wajib diisi");
      return;
    }
    setError(null);

    const payload = { name: trimmedName, color, icon: icon.trim() || undefined };

    if (isEditing && editingCategory) {
      updateCategory.mutate(
        { categoryId: editingCategory.id, payload },
        {
          onSuccess: () => onOpenChange(false),
          onError: (err) => setError(err instanceof Error ? err.message : "Gagal menyimpan kategori"),
        }
      );
    } else {
      createCategory.mutate(payload, {
        onSuccess: () => onOpenChange(false),
        onError: (err) => setError(err instanceof Error ? err.message : "Gagal menyimpan kategori"),
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category-name">Nama Kategori</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Social Media, Finance, dll"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category-icon">Icon (opsional, emoji)</Label>
            <Input
              id="category-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value.slice(0, 4))}
              placeholder="🔐"
              className="w-20 text-center text-lg"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Warna</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setColor(preset)}
                  className="flex size-8 items-center justify-center rounded-full border-2 border-border"
                  style={{ backgroundColor: preset }}
                  aria-label={`Pilih warna ${preset}`}
                >
                  {color === preset && <Check className="size-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="neutral" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? "Simpan Perubahan" : "Tambah Kategori"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
