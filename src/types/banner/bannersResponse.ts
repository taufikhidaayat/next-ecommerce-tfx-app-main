import { Banner } from "./banner";

export interface BannersResponse {
    status: string;
    message: string;
    data: Banner[];
}