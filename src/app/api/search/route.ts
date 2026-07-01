import { api } from "@/lib/axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const query = new URLSearchParams(searchParams).toString();

    try {
        const response = await api.get(`/search?${query}`);

        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        console.error("Error fetching search results:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}