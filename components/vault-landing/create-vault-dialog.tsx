'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, ShieldAlert, TriangleAlert } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { createVaultFormSchema, type CreateVaultFormValues } from '@/lib/validations/vault';
import { generateSecretKey } from '@/lib/utils/secret-key-generator';
import { SecretKeyDisplay } from '@/components/vault-landing/secret-key-display';
import { useCreateVaultWithCrypto } from '@/hooks/use-create-vault-with-crypto';
import { useVaultStore } from '@/lib/stores/vault-store';

interface CreateVaultDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateVaultDialog({ open, onOpenChange }: CreateVaultDialogProps) {
    const router = useRouter();
    const unlockStore = useVaultStore(s => s.unlock);
    const createVault = useCreateVaultWithCrypto();

    const [showPassword, setShowPassword] = useState(false);
    const [confirmedSaved, setConfirmedSaved] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<CreateVaultFormValues>({
        resolver: zodResolver(createVaultFormSchema),
        defaultValues: {
            name: '',
            masterPassword: '',
            confirmMasterPassword: '',
            secretKey: '',
        },
    });

    const secretKey = watch('secretKey');

    useEffect(() => {
        if (open) {
            reset({
                name: '',
                masterPassword: '',
                confirmMasterPassword: '',
                secretKey: generateSecretKey(),
            });
            setShowPassword(false);
            setConfirmedSaved(false);
            setErrorMessage(null);
        }
    }, [open, reset]);

    function onSubmit(values: CreateVaultFormValues) {
        setErrorMessage(null);
        createVault.mutate(values, {
            onSuccess: ({ vaultId, vaultName, vaultKey }) => {
                unlockStore(vaultId, vaultName, vaultKey);
                router.push('/vault');
            },
            onError: error => {
                setErrorMessage(error instanceof Error ? error.message : 'Gagal membuat vault');
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Buat Vault Baru</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="name">Nama Vault</Label>
                        <Input id="name" placeholder="Personal, Work, dll" {...register('name')} />
                        {errors.name && (
                            <p className="text-xs text-destructive">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="masterPassword">Master Password</Label>
                        <div className="relative">
                            <Input
                                id="masterPassword"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="off"
                                {...register('masterPassword')}
                            />
                            <Button
                                type="button"
                                variant="noShadow"
                                size="icon"
                                className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
                                onClick={() => setShowPassword(prev => !prev)}
                            >
                                {showPassword ? (
                                    <EyeOff className="size-3.5" />
                                ) : (
                                    <Eye className="size-3.5" />
                                )}
                            </Button>
                        </div>
                        {errors.masterPassword && (
                            <p className="text-xs text-destructive">
                                {errors.masterPassword.message}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="confirmMasterPassword">Konfirmasi Master Password</Label>
                        <Input
                            id="confirmMasterPassword"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="off"
                            {...register('confirmMasterPassword')}
                        />
                        {errors.confirmMasterPassword && (
                            <p className="text-xs text-destructive">
                                {errors.confirmMasterPassword.message}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Secret Key</Label>
                        <SecretKeyDisplay
                            value={secretKey}
                            onRegenerate={() => setValue('secretKey', generateSecretKey())}
                        />
                        {errors.secretKey && (
                            <p className="text-xs text-destructive">{errors.secretKey.message}</p>
                        )}
                    </div>

                    <div className="flex gap-2 border-2 border-border bg-secondary-background p-3">
                        <TriangleAlert className="size-5 shrink-0 text-destructive" />
                        <p className="text-xs">
                            Secret Key <strong>tidak pernah disimpan</strong> di server dan{' '}
                            <strong>tidak bisa dipulihkan</strong> jika hilang. Simpan Master
                            Password dan Secret Key ini di tempat yang aman — kamu butuh keduanya
                            setiap kali membuka vault ini.
                        </p>
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                            checked={confirmedSaved}
                            onCheckedChange={checked => setConfirmedSaved(Boolean(checked))}
                        />
                        Saya sudah menyimpan Secret Key ini di tempat yang aman
                    </label>

                    {errorMessage && (
                        <p className="flex items-center gap-1.5 text-sm text-destructive">
                            <ShieldAlert className="size-4" />
                            {errorMessage}
                        </p>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="neutral" onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={!confirmedSaved || createVault.isPending}>
                            {createVault.isPending && (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            )}
                            {createVault.isPending ? 'Membuat Vault...' : 'Buat & Buka Vault'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
