export function sanitizeQueryParam(str: string): string {
    // Allow letters/digits/underscore, whitespace, dash, ampersand, dot, apostrophe
    // (& dibutuhkan untuk nama kategori spt "Roti & Selai", apostrophe untuk brand spt "Wall's")
    return decodeURIComponent(str)
        .replace(/[^\w\s\-&.']/g, "");
}