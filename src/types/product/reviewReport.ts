export const REVIEW_REPORT_REASONS = [
    "SPAM",
    "ABUSIVE",
    "IRRELEVANT",
    "MISLEADING",
    "OTHER",
] as const;

export type ReviewReportReason = (typeof REVIEW_REPORT_REASONS)[number];

export interface ReportReviewInput {
    reviewId: string;
    reason: ReviewReportReason;
    note?: string;
}
