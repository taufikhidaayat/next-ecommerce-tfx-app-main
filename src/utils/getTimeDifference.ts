export function getTimeDifference(inputDate: string | Date): string {
    const now = new Date().getTime();
    const target = new Date(inputDate).getTime();
    const diffMs = now - target;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30); // approx
    const years = Math.floor(days / 365); // approx

    if (seconds < 60) return "baru saja";
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;
    if (weeks < 4) return `${weeks} minggu lalu`;
    if (months < 12) return `${months} bulan lalu`;
    return `${years} tahun lalu`;
}
