import { MetaData } from "../metadata";
import { ProductReview } from "./productReview";

export interface ProductReviewsResponse {
    status: string;
    message: string;
    data: {
        data: {
            reviews: ProductReview[];
            ratingDistribution: {
                [key: string]: number;
            };
        }
        meta: MetaData;
    };
}