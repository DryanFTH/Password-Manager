'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    PasswordItemFormInput,
    passwordItemFormSchema,
    type PasswordItemFormValues,
} from '@/lib/validations/password-item';
import { PasswordStrengthMeter } from '@/components/vault/password-strength-meter';
import { PasswordGeneratorPanel } from '@/components/vault/password-generator-panel';
import { checkPasswordPwned } from '@/lib/utils/pwned-check';
import { useCreatePasswordItem, useUpdatePasswordItem } from '@/hooks/use-password-item-mutations';
import type { DecryptedCategory, DecryptedPasswordItem } from '@/types/vault';

interface AddEditPasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: DecryptedCategory[];
    editingItem: DecryptedPasswordItem | null;
}

type PwnedState =
    | { status: 'idle' }
    | { status: 'checking' }
    | { status: 'safe' }
    | { status: 'breached'; count: number }
    | { status: 'error' };

const EMPTY_VALUES: PasswordItemFormValues = {
    website: '',
    username: '',
    password: '',
    notes: '',
    categoryId: null,
    favorite: false,
    customFields: [],
};

export function AddEditPasswordDialog({
    open,
    onOpenChange,
    categories,
    editingItem,
}: AddEditPasswordDialogProps) {
    const [showGenerator, setShowGenerator] = useState(false);
    const [pwnedState, setPwnedState] = useState<PwnedState>({ status: 'idle' });

    const createItem = useCreatePasswordItem();
    const updateItem = useUpdatePasswordItem();
    const isEditing = Boolean(editingItem);

    const {
        register,
        control,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<PasswordItemFormInput, unknown, PasswordItemFormValues>({
        resolver: zodResolver(passwordItemFormSchema),
        defaultValues: EMPTY_VALUES,
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'customFields' });
    const passwordValue = watch('password');

    useEffect(() => {
        if (open) {
            reset(
                editingItem
                    ? {
                          website: editingItem.website,
                          username: editingItem.username,
                          password: editingItem.password,
                          notes: editingItem.notes ?? '',
                          categoryId: editingItem.categoryId,
                          favorite: editingItem.favorite,
                          customFields: editingItem.customFields ?? [],
                      }
                    : EMPTY_VALUES,
            );
            setPwnedState({ status: 'idle' });
            setShowGenerator(false);
        }
    }, [open, editingItem, reset]);

    async function handleCheckPwned() {
        if (!passwordValue) return;
        setPwnedState({ status: 'checking' });
        try {
            const count = await checkPasswordPwned(passwordValue);
            setPwnedState(count > 0 ? { status: 'breached', count } : { status: 'safe' });
        } catch {
            setPwnedState({ status: 'error' });
        }
    }

    function onSubmit(values: PasswordItemFormValues) {
        if (isEditing && editingItem) {
            const passwordChanged = values.password !== editingItem.password;
            updateItem.mutate(
                { itemId: editingItem.id, values, passwordChanged },
                { onSuccess: () => onOpenChange(false) },
            );
        } else {
            createItem.mutate(values, { onSuccess: () => onOpenChange(false) });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Password' : 'Tambah Password'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="website">Website</Label>
                        <Input
                            id="website"
                            placeholder="https://contoh.com"
                            {...register('website')}
                        />
                        {errors.website && (
                            <p className="text-xs text-destructive">{errors.website.message}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="username">Username / Email</Label>
                        <Input id="username" {...register('username')} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Button
                                type="button"
                                variant="neutral"
                                size="sm"
                                onClick={() => setShowGenerator(prev => !prev)}
                            >
                                {showGenerator ? 'Sembunyikan Generator' : 'Buka Generator'}
                            </Button>
                        </div>
                        <Input
                            id="password"
                            type="text"
                            className="font-mono"
                            {...register('password')}
                        />
                        {errors.password && (
                            <p className="text-xs text-destructive">{errors.password.message}</p>
                        )}
                    </div>

                    {showGenerator && (
                        <PasswordGeneratorPanel
                            onGenerate={value =>
                                setValue('password', value, { shouldValidate: true })
                            }
                        />
                    )}

                    <PasswordStrengthMeter password={passwordValue} />

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            variant="neutral"
                            size="sm"
                            onClick={handleCheckPwned}
                            disabled={!passwordValue || pwnedState.status === 'checking'}
                        >
                            {pwnedState.status === 'checking' ? (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            ) : (
                                <ShieldAlert className="mr-2 size-4" />
                            )}
                            Cek Kebocoran Password
                        </Button>
                        {pwnedState.status === 'safe' && (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                                <ShieldCheck className="size-3.5" /> Tidak ditemukan pada kebocoran
                                data
                            </span>
                        )}
                        {pwnedState.status === 'breached' && (
                            <span className="text-xs text-destructive">
                                ⚠ Ditemukan {pwnedState.count.toLocaleString('id-ID')}x pada
                                kebocoran data publik
                            </span>
                        )}
                        {pwnedState.status === 'error' && (
                            <span className="text-xs text-muted-foreground">
                                Gagal memeriksa, coba lagi nanti
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Kategori</Label>
                        <Select
                            value={watch('categoryId') ?? 'none'}
                            onValueChange={value =>
                                setValue('categoryId', value === 'none' ? null : value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Tanpa Kategori</SelectItem>
                                {categories.map(category => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="notes">Catatan</Label>
                        <Textarea id="notes" rows={3} {...register('notes')} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <Label>Custom Fields</Label>
                            <Button
                                type="button"
                                variant="neutral"
                                size="sm"
                                onClick={() => append({ label: '', value: '' })}
                            >
                                <Plus className="mr-1 size-3.5" /> Tambah Field
                            </Button>
                        </div>
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-2">
                                <Input
                                    placeholder="Label"
                                    {...register(`customFields.${index}.label` as const)}
                                />
                                <Input
                                    placeholder="Nilai"
                                    {...register(`customFields.${index}.value` as const)}
                                />
                                <Button
                                    type="button"
                                    variant="neutral"
                                    size="icon"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                            checked={watch('favorite')}
                            onCheckedChange={checked => setValue('favorite', Boolean(checked))}
                        />
                        Tandai sebagai favorit
                    </label>

                    <DialogFooter>
                        <Button type="button" variant="neutral" onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || createItem.isPending || updateItem.isPending}
                        >
                            {isEditing ? 'Simpan Perubahan' : 'Simpan Password'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
