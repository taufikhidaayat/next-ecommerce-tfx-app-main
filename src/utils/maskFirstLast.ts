export function maskFirstLast(input: string): string {
    if (!input) return "";

    const trimmed = input.trim();
    if (trimmed.length <= 2) return trimmed;

    const firstChar = trimmed.charAt(0);
    const lastChar = trimmed.charAt(trimmed.length - 1);

    return `${firstChar}***${lastChar}`;
}