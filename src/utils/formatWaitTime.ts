export const formatWaitTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const mStr = m > 0 ? `${m} minute${m !== 1 ? "s" : ""}` : "";
    const sStr = s > 0 ? `${s} second${s !== 1 ? "s" : ""}` : "";
    return [mStr, sStr].filter(Boolean).join(" ");
};