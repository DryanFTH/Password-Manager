import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const updateCategorySchema = z.object({
    nonce: z.string().min(1),
    ciphertext: z.string().min(1),
});

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ vaultId: string; categoryId: string }> },
) {
    const { vaultId, categoryId } = await params;

    try {
        const body = await request.json();
        const parsed = updateCategorySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Payload tidak valid', details: parsed.error.flatten() },
                { status: 400 },
            );
        }

        const existing = await prisma.category.findFirst({ where: { id: categoryId, vaultId } });
        if (!existing) {
            return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
        }

        const updated = await prisma.category.update({
            where: { id: categoryId },
            data: { nonce: parsed.data.nonce, ciphertext: parsed.data.ciphertext },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('[CATEGORY_PATCH]', error);
        return NextResponse.json({ error: 'Gagal memperbarui kategori' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ vaultId: string; categoryId: string }> },
) {
    const { vaultId, categoryId } = await params;

    try {
        const existing = await prisma.category.findFirst({ where: { id: categoryId, vaultId } });
        if (!existing) {
            return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
        }

        await prisma.category.delete({ where: { id: categoryId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[CATEGORY_DELETE]', error);
        return NextResponse.json({ error: 'Gagal menghapus kategori' }, { status: 500 });
    }
}
