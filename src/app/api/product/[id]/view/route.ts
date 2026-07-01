import { api } from "@/lib/axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Catat user membuka detail produk (butuh login).
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const response = await api.post(
            `/product/${id}/view`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );

        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        console.error("Error recording product view:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
