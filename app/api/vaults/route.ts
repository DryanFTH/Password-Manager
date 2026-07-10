import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const DEFAULT_ARGON_MEMORY_COST = 19456;
const DEFAULT_ARGON_TIME_COST = 2;
const DEFAULT_ARGON_PARALLELISM = 1;

const createVaultSchema = z.object({
    name: z.string().min(1).max(100),
    salt: z.string().min(1),
    protectedVaultKeyNonce: z.string().min(1),
    protectedVaultKeyCiphertext: z.string().min(1),
    argonMemoryCost: z.number().int().positive().optional(),
    argonTimeCost: z.number().int().positive().optional(),
    argonParallelism: z.number().int().positive().optional(),
});

export async function GET() {
    try {
        const vaults = await prisma.vault.findMany({
            select: { id: true, name: true, createdAt: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
        });
        return NextResponse.json(vaults);
    } catch (error) {
        console.error('[VAULTS_GET]', error);
        return NextResponse.json({ error: 'Gagal memuat daftar vault' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = createVaultSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Payload tidak valid', details: parsed.error.flatten() },
                { status: 400 },
            );
        }

        const vault = await prisma.vault.create({
            data: {
                name: parsed.data.name,
                salt: parsed.data.salt,
                protectedVaultKeyNonce: parsed.data.protectedVaultKeyNonce,
                protectedVaultKeyCiphertext: parsed.data.protectedVaultKeyCiphertext,
                argonMemoryCost: parsed.data.argonMemoryCost ?? DEFAULT_ARGON_MEMORY_COST,
                argonTimeCost: parsed.data.argonTimeCost ?? DEFAULT_ARGON_TIME_COST,
                argonParallelism: parsed.data.argonParallelism ?? DEFAULT_ARGON_PARALLELISM,
            },
            select: { id: true, name: true, createdAt: true, updatedAt: true },
        });

        return NextResponse.json(vault, { status: 201 });
    } catch (error) {
        console.error('[VAULTS_POST]', error);
        return NextResponse.json({ error: 'Gagal membuat vault' }, { status: 500 });
    }
}
