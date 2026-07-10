export interface CustomField {
    label: string;
    value: string;
}

export interface PasswordItemPayload {
    website: string;
    username: string;
    password: string;
    notes?: string;
    favorite: boolean;
    customFields?: CustomField[];
}

export interface DecryptedPasswordItem extends PasswordItemPayload {
    id: string;
    vaultId: string;
    categoryId: string | null;
    createdAt: string;
    updatedAt: string;
    passwordSetAt: string;
    lastUsedAt: string | null;
    isFavorite: boolean;
    isDeleted: boolean;
    /** true jika AES-GCM decrypt gagal (kemungkinan data korup / vault key salah) */
    decryptFailed?: boolean;
}

export interface CategoryPayload {
    name: string;
    color?: string;
    icon?: string;
}

export interface DecryptedCategory extends CategoryPayload {
    id: string;
    vaultId: string;
    sortOrder: number;
}

export interface EncryptedPasswordItemDTO {
    id: string;
    vaultId: string;
    categoryId: string | null;
    nonce: string;
    ciphertext: string;
    createdAt: string;
    updatedAt: string;
    passwordSetAt: string;
    lastUsedAt: string | null;
    isFavorite: boolean;
    isDeleted: boolean;
    deletedAt: string | null;
}

export interface EncryptedCategoryDTO {
    id: string;
    vaultId: string;
    nonce: string;
    ciphertext: string;
    sortOrder: number;
}

export interface VaultSummary {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface VaultUnlockMaterial {
    id: string;
    name: string;
    salt: string;
    protectedVaultKeyNonce: string;
    protectedVaultKeyCiphertext: string;
    argonMemoryCost: number;
    argonTimeCost: number;
    argonParallelism: number;
}
