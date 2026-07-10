import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const createItemSchema = z.object({
    categoryId: z.string().nullable().optional(),
    nonce: z.string().min(1),
    ciphertext: z.string().min(1),
    favorite: z.boolean().optional().default(false),
});

export async function GET(request: Request, { params }: { params: Promise<{ vaultId: string }> }) {
    const { vaultId } = await params;
    const { searchParams } = new URL(request.url);
    const trash = searchParams.get('trash') === '1';

    try {
        const items = await prisma.passwordItem.findMany({
            where: { vaultId, isDeleted: trash },
            orderBy: { updatedAt: 'desc' },
        });
        return NextResponse.json(items);
    } catch (error) {
        console.error('[VAULT_ITEMS_GET]', error);
        return NextResponse.json({ error: 'Gagal memuat item vault' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ vaultId: string }> }) {
    const { vaultId } = await params;

    try {
        const body = await request.json();
        const parsed = createItemSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Payload tidak valid', details: parsed.error.flatten() },
                { status: 400 },
            );
        }

        const vault = await prisma.vault.findUnique({ where: { id: vaultId } });
        if (!vault) {
            return NextResponse.json({ error: 'Vault tidak ditemukan' }, { status: 404 });
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

        const item = await prisma.passwordItem.create({
            data: {
                vaultId,
                categoryId: parsed.data.categoryId ?? null,
                nonce: parsed.data.nonce,
                ciphertext: parsed.data.ciphertext,
                isFavorite: parsed.data.favorite,
            },
        });

        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error('[VAULT_ITEMS_POST]', error);
        return NextResponse.json({ error: 'Gagal menyimpan item' }, { status: 500 });
    }
}
