import { LinkType } from "@/enum/linkType";

export interface Banner {
    id?: string;
    name: string;
    linkType?: LinkType;
    linkValue?: string;
    path?: string;
    link?: string;
    url: string;
    description: string;
    sequence?: number;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}