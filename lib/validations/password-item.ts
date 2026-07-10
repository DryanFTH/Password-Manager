import { z } from 'zod';

export const customFieldSchema = z.object({
    label: z.string().min(1, 'Label wajib diisi').max(50),
    value: z.string().max(500),
});

export const passwordItemFormSchema = z.object({
    website: z.string().min(1, 'Website wajib diisi').max(200),
    username: z.string().max(200).optional().default(''),
    password: z.string().min(1, 'Password wajib diisi').max(500),
    notes: z.string().max(2000).optional().default(''),
    categoryId: z.string().nullable().optional().default(null),
    favorite: z.boolean().default(false),
    customFields: z.array(customFieldSchema).max(10).default([]),
});

export type PasswordItemFormInput = z.input<typeof passwordItemFormSchema>;
export type PasswordItemFormValues = z.output<typeof passwordItemFormSchema>;
