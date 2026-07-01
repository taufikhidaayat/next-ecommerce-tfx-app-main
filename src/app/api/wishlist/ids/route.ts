import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/lib/axios";

export async function GET(_req: NextRequest) {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const response = await api.get("/wishlist/ids", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return NextResponse.json(response.data, { status: response.status });
    } catch (error: any) {
        const status = error?.response?.status ?? 500;
        const data = error?.response?.data ?? { message: "Internal Server Error" };
        return NextResponse.json(data, { status });
    }
}
