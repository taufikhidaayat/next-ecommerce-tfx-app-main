import { Gender } from "@/enum/gender";
import { enumValues } from "@/utils/enumValues";
import { z } from "zod";

export const profileSchema = z.object({
    name: z.string().min(1, "Name cannot be empty."),
    phone: z
        .string()
        .regex(
            /^0?8[1-9][0-9]{6,11}$/,
            "Mohon masukkan nomor telepon yang benar."
        ),
    // Address is managed separately in "Alamat Saya" (AddressSection), so it is optional here.
    address: z.string().optional(),
    // Tanggal lahir & jenis kelamin opsional (boleh kosong), selaras dengan form daftar.
    birthDate: z.string().optional(),
    gender: z.enum(enumValues(Gender)),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
