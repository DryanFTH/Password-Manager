import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const updateItemSchema = z.object({
    categoryId: z.string().nullable().optional(),
    nonce: z.string().min(1).optional(),
    ciphertext: z.string().min(1).optional(),
    favorite: z.boolean().optional(),
    passwordChanged: z.boolean().optional().default(false),
    markUsed: z.boolean().optional().default(false),
    restore: z.boolean().optional().default(false),
});

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ vaultId: string; itemId: string }> },
) {
    const { vaultId, itemId } = await params;

    try {
        const body = await request.json();
        const parsed = updateItemSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Payload tidak valid', details: parsed.error.flatten() },
                { status: 400 },
            );
        }

        const existing = await prisma.passwordItem.findFirst({ where: { id: itemId, vaultId } });
        if (!existing) {
            return NextResponse.json({ error: 'Item tidak ditemukan' }, { status: 404 });
        }

        if (parsed.data.categoryId) {
            const category = await prisma.category.findFirst({
                where: { id: parsed.data.categoryId, vaultId },
            });
            if (!category) {
                return NextResponse.json(
                    { error: 'Kategori tidak ditemukan pada vault ini' },
                    { status: 400 },
                );
            }
        }

        const { passwordChanged, markUsed, restore, favorite, categoryId, nonce, ciphertext } =
            parsed.data;

        const updated = await prisma.passwordItem.update({
            where: { id: itemId },
            data: {
                ...(categoryId !== undefined ? { categoryId } : {}),
                ...(nonce !== undefined ? { nonce } : {}),
                ...(ciphertext !== undefined ? { ciphertext } : {}),
                ...(favorite !== undefined ? { isFavorite: favorite } : {}),
                ...(passwordChanged ? { passwordSetAt: new Date() } : {}),
                ...(markUsed ? { lastUsedAt: new Date() } : {}),
                ...(restore ? { isDeleted: false, deletedAt: null } : {}),
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('[VAULT_ITEM_PATCH]', error);
        return NextResponse.json({ error: 'Gagal memperbarui item' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ vaultId: string; itemId: string }> },
) {
    const { vaultId, itemId } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === '1';

    try {
        const existing = await prisma.passwordItem.findFirst({ where: { id: itemId, vaultId } });
        if (!existing) {
            return NextResponse.json({ error: 'Item tidak ditemukan' }, { status: 404 });
        }

        if (permanent) {
            await prisma.passwordItem.delete({ where: { id: itemId } });
            return NextResponse.json({ success: true, permanent: true });
        }

        const updated = await prisma.passwordItem.update({
            where: { id: itemId },
            data: { isDeleted: true, deletedAt: new Date() },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('[VAULT_ITEM_DELETE]', error);
        return NextResponse.json({ error: 'Gagal menghapus item' }, { status: 500 });
    }
}
