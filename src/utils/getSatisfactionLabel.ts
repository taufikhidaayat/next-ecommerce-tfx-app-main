// Mengubah rata-rata rating jadi label kepuasan (mis. "Sangat Baik", "Cukup").
// Parameter t = fungsi terjemahan, jadi label mengikuti bahasa yang aktif.
export function getSatisfactionLabel(
    avgRating: number,
    ratingCount: number,
    t: (key: string) => string
): string {
    if (ratingCount === 0) return t("satisfactionLabel.noRating");
    if (avgRating < 2) return t("satisfactionLabel.poor");
    if (avgRating < 3) return t("satisfactionLabel.below");
    if (avgRating < 3.5) return t("satisfactionLabel.average");
    if (avgRating < 4.3) return t("satisfactionLabel.good");
    return t("satisfactionLabel.excellent");
}