import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/axios";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const query = new URLSearchParams(searchParams).toString();

    try {
        const response = await api.get(`/brands?${query}`);

        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        console.error("Error fetching brands:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
