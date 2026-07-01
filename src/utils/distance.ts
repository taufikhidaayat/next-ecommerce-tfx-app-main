/**
 * Calculate Euclidean distance between two geographic points.
 * Uses the approximation that 1 degree ≈ 111.32 km (near the equator/Indonesia).
 *
 * @returns distance in kilometers, rounded to 2 decimal places
 */
export function calculateEuclideanDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
): number {
    const d = Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2)) * 111.32;
    return Math.round(d * 100) / 100;
}
