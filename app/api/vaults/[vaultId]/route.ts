import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ vaultId: string }> }) {
    const { vaultId } = await params;

    try {
        const vault = await prisma.vault.findUnique({
            where: { id: vaultId },
            select: {
                id: true,
                name: true,
                salt: true,
                protectedVaultKeyNonce: true,
                protectedVaultKeyCiphertext: true,
                argonMemoryCost: true,
                argonTimeCost: true,
                argonParallelism: true,
            },
        });

        if (!vault) {
            return NextResponse.json({ error: 'Vault tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json(vault);
    } catch (error) {
        console.error('[VAULT_GET]', error);
        return NextResponse.json({ error: 'Gagal memuat vault' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ vaultId: string }> },
) {
    const { vaultId } = await params;

    try {
        const existing = await prisma.vault.findUnique({ where: { id: vaultId } });
        if (!existing) {
            return NextResponse.json({ error: 'Vault tidak ditemukan' }, { status: 404 });
        }

        await prisma.vault.delete({ where: { id: vaultId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[VAULT_DELETE]', error);
        return NextResponse.json({ error: 'Gagal menghapus vault' }, { status: 500 });
    }
}
