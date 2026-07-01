import { api } from "@/lib/axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Catat kata pencarian (sinyal rekomendasi). Optional auth: tamu → backend no-op.
export async function POST(req: NextRequest) {
    const token = (await cookies()).get("token")?.value;
    const body = await req.json();

    try {
        const response = await api.post(`/product/search-log`, body, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        console.error("Error logging search query:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
