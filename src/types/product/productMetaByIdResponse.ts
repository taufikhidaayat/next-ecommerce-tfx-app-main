export interface productMetaByIdResponse {
    status: string;
    message: string;
    data: {
        name: string;
        description: string;
    };
}