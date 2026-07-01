import { api } from "@/lib/axios";
import { isAxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const response = await api.get(`/product/${id}`);

        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            return NextResponse.json(error.response.data, {
                status: error.response.status,
            });
        }
        console.error("Error fetching product by ID:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}