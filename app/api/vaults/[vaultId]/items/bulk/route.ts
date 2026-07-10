import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const bulkActionSchema = z.object({
    action: z.enum(['delete', 'restore', 'favorite', 'unfavorite', 'permanentDelete']),
    ids: z.array(z.string().min(1)).min(1).max(500),
});

export async function POST(request: Request, { params }: { params: Promise<{ vaultId: string }> }) {
    const { vaultId } = await params;

    try {
        const body = await request.json();
        const parsed = bulkActionSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Payload tidak valid', details: parsed.error.flatten() },
                { status: 400 },
            );
        }

        const { action, ids } = parsed.data;
        const where = { vaultId, id: { in: ids } };

        switch (action) {
            case 'delete':
                await prisma.passwordItem.updateMany({
                    where,
                    data: { isDeleted: true, deletedAt: new Date() },
                });
                break;
            case 'restore':
                await prisma.passwordItem.updateMany({
                    where,
                    data: { isDeleted: false, deletedAt: null },
                });
                break;
            case 'favorite':
                await prisma.passwordItem.updateMany({ where, data: { isFavorite: true } });
                break;
            case 'unfavorite':
                await prisma.passwordItem.updateMany({ where, data: { isFavorite: false } });
                break;
            case 'permanentDelete':
                await prisma.passwordItem.deleteMany({ where });
                break;
        }

        return NextResponse.json({ success: true, action, affected: ids.length });
    } catch (error) {
        console.error('[VAULT_ITEMS_BULK]', error);
        return NextResponse.json({ error: 'Gagal memproses aksi massal' }, { status: 500 });
    }
}
