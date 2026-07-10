import { z } from "zod";

export const unlockVaultFormSchema = z.object({
  masterPassword: z.string().min(1, "Master Password wajib diisi"),
  secretKey: z.string().min(1, "Secret Key wajib diisi"),
});

export type UnlockVaultFormValues = z.infer<typeof unlockVaultFormSchema>;

export const createVaultFormSchema = z
  .object({
    name: z.string().min(1, "Nama vault wajib diisi").max(100),
    masterPassword: z
      .string()
      .min(8, "Master Password minimal 8 karakter"),
    confirmMasterPassword: z.string().min(1, "Konfirmasi Master Password wajib diisi"),
    secretKey: z.string().min(8, "Secret Key minimal 8 karakter"),
  })
  .refine((data) => data.masterPassword === data.confirmMasterPassword, {
    message: "Konfirmasi Master Password tidak cocok",
    path: ["confirmMasterPassword"],
  });

export type CreateVaultFormValues = z.infer<typeof createVaultFormSchema>;
