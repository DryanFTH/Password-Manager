import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import z from 'zod';

const createCategorySchema = z.object({
    nonce: z.string().min(1),
    ciphertext: z.string().min(1),
});

export async function GET(request: Request, { params }: { params: Promise<{ vaultId: string }> }) {
    const { vaultId } = await params;

    try {
        const categories = await prisma.category.findMany({
            where: { vaultId },
            orderBy: { sortOrder: 'asc' },
        });
        return NextResponse.json(categories);
    } catch (error) {
        console.error('[VAULT_CATEGORIES_GET]', error);
        return NextResponse.json({ error: 'Gagal memuat kategori' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ vaultId: string }> }) {
    const { vaultId } = await params;

    try {
        const body = await request.json();
        const parsed = createCategorySchema.safeParse(body);

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

        const last = await prisma.category.aggregate({
            where: { vaultId },
            _max: { sortOrder: true },
        });
        const nextSortOrder = (last._max.sortOrder ?? -1) + 1;

        const category = await prisma.category.create({
            data: {
                vaultId,
                nonce: parsed.data.nonce,
                ciphertext: parsed.data.ciphertext,
                sortOrder: nextSortOrder,
            },
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('[VAULT_CATEGORIES_POST]', error);
        return NextResponse.json({ error: 'Gagal membuat kategori' }, { status: 500 });
    }
}
