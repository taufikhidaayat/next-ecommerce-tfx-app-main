import { api } from "@/lib/axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Optional auth: kalau ada token → rekomendasi personal; kalau tidak → produk populer.
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const query = new URLSearchParams(searchParams).toString();
    const token = (await cookies()).get("token")?.value;

    try {
        const response = await api.get(`/product/recommendations?${query}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
