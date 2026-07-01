export function truncateDescription(desc: string, maxLength: number): string {
    if (desc.length > maxLength) {
        return desc.substring(0, maxLength) + '...';
    }
    return desc;
}