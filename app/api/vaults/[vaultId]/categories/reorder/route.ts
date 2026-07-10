import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const reorderSchema = z.object({
    orderedIds: z.array(z.string().min(1)).min(1).max(500),
});

export async function POST(request: Request, { params }: { params: Promise<{ vaultId: string }> }) {
    const { vaultId } = await params;

    try {
        const body = await request.json();
        const parsed = reorderSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Payload tidak valid', details: parsed.error.flatten() },
                { status: 400 },
            );
        }

        const { orderedIds } = parsed.data;

        const ownedCount = await prisma.category.count({
            where: { vaultId, id: { in: orderedIds } },
        });
        if (ownedCount !== orderedIds.length) {
            return NextResponse.json(
                { error: 'Beberapa kategori tidak ditemukan pada vault ini' },
                { status: 400 },
            );
        }

        await prisma.$transaction(
            orderedIds.map((id, index) =>
                prisma.category.update({ where: { id }, data: { sortOrder: index } }),
            ),
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[CATEGORIES_REORDER]', error);
        return NextResponse.json({ error: 'Gagal menyimpan urutan kategori' }, { status: 500 });
    }
}
