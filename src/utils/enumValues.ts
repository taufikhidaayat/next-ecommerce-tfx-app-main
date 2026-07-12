// Mengambil semua NILAI dari sebuah enum sebagai array. Berguna mis. untuk membuat
// aturan validasi Zod (z.enum) dari enum yang sudah ada, tanpa menulis ulang daftarnya.
export const enumValues = <T extends Record<string, string>>(e: T) => {
    return Object.values(e) as [string, ...string[]];
};