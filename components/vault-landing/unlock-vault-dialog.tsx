'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, ShieldAlert } from 'lucide-react';
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
import { unlockVaultFormSchema, type UnlockVaultFormValues } from '@/lib/validations/vault';
import { useUnlockVault } from '@/hooks/use-unlock-vault';
import { useVaultStore } from '@/lib/stores/vault-store';
import type { VaultSummary } from '@/types/vault';

interface UnlockVaultDialogProps {
    vault: VaultSummary | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UnlockVaultDialog({ vault, open, onOpenChange }: UnlockVaultDialogProps) {
    const router = useRouter();
    const unlockStore = useVaultStore(s => s.unlock);
    const unlockVault = useUnlockVault();
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<UnlockVaultFormValues>({
        resolver: zodResolver(unlockVaultFormSchema),
        defaultValues: { masterPassword: '', secretKey: '' },
    });

    useEffect(() => {
        if (open) {
            reset({ masterPassword: '', secretKey: '' });
            setErrorMessage(null);
            setShowPassword(false);
        }
    }, [open, reset]);

    function onSubmit(values: UnlockVaultFormValues) {
        if (!vault) return;
        setErrorMessage(null);

        unlockVault.mutate(
            {
                vaultId: vault.id,
                masterPassword: values.masterPassword,
                secretKey: values.secretKey,
            },
            {
                onSuccess: ({ vaultId, vaultName, vaultKey }) => {
                    unlockStore(vaultId, vaultName, vaultKey);
                    router.push('/vault');
                },
                onError: error => {
                    setErrorMessage(error instanceof Error ? error.message : 'Gagal membuka vault');
                },
            },
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Buka Vault {vault ? `"${vault.name}"` : ''}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                        <Label htmlFor="secretKey">Secret Key</Label>
                        <Input
                            id="secretKey"
                            className="font-mono"
                            autoComplete="off"
                            placeholder="kata-kata-kata-kata-12345"
                            {...register('secretKey')}
                        />
                        {errors.secretKey && (
                            <p className="text-xs text-destructive">{errors.secretKey.message}</p>
                        )}
                    </div>

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
                        <Button type="submit" disabled={unlockVault.isPending}>
                            {unlockVault.isPending && (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            )}
                            {unlockVault.isPending ? 'Membuka Vault...' : 'Buka Vault'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
