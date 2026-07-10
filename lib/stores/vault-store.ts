import { create } from 'zustand';

interface VaultState {
    vaultId: string | null;
    vaultName: string | null;
    vaultKey: CryptoKey | null;
    unlock: (vaultId: string, vaultName: string, vaultKey: CryptoKey) => void;
    lock: () => void;
}

export const useVaultStore = create<VaultState>(set => ({
    vaultId: null,
    vaultName: null,
    vaultKey: null,
    unlock: (vaultId, vaultName, vaultKey) => set({ vaultId, vaultName, vaultKey }),
    lock: () => set({ vaultId: null, vaultName: null, vaultKey: null }),
}));
