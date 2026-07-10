-- CreateTable
CREATE TABLE "vaults" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "protectedVaultKeyNonce" TEXT NOT NULL,
    "protectedVaultKeyCiphertext" TEXT NOT NULL,
    "argonMemoryCost" INTEGER NOT NULL DEFAULT 19456,
    "argonTimeCost" INTEGER NOT NULL DEFAULT 2,
    "argonParallelism" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vaultId" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "categories_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "vaults" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "password_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vaultId" TEXT NOT NULL,
    "categoryId" TEXT,
    "nonce" TEXT NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "passwordSetAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" DATETIME,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    CONSTRAINT "password_items_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "vaults" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "password_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "categories_vaultId_idx" ON "categories"("vaultId");

-- CreateIndex
CREATE INDEX "password_items_vaultId_idx" ON "password_items"("vaultId");

-- CreateIndex
CREATE INDEX "password_items_categoryId_idx" ON "password_items"("categoryId");

-- CreateIndex
CREATE INDEX "password_items_vaultId_isFavorite_idx" ON "password_items"("vaultId", "isFavorite");

-- CreateIndex
CREATE INDEX "password_items_vaultId_isDeleted_idx" ON "password_items"("vaultId", "isDeleted");
