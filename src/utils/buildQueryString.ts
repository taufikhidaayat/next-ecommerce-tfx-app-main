// Ubah objek filter jadi query string URL (mis. { page:1, search:"abc" } → "page=1&search=abc").
// Nilai kosong dilewati. Dipakai semua pemanggilan API daftar. (Sama seperti util di CMS.)
export function buildQueryString(query: unknown): string {
    const params = new URLSearchParams();

    Object.entries(query as Record<string, unknown>).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params.append(key, String(value));
        }
    });

    return params.toString();
}
