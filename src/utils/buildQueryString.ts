export function buildQueryString(query: unknown): string {
    const params = new URLSearchParams();

    Object.entries(query as Record<string, unknown>).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params.append(key, String(value));
        }
    });

    return params.toString();
}
