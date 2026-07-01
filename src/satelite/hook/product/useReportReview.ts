import { apiClient } from "@/lib/client/axios-client";
import { ReportReviewInput } from "@/types/product/reviewReport";

export const reportReview = async (input: ReportReviewInput) => {
    const response = await apiClient.post(`/review-reports`, input);
    return response.data;
};
