import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/axios";

export const dynamic = "force-dynamic";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const searchParams = req.nextUrl.searchParams;
    const query = new URLSearchParams(searchParams).toString();

    const { id } = await params;

    try {
        const response = await api.get(`/product/${id}/reviews?${query}`);

        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        console.error("Error fetching product reviews:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
