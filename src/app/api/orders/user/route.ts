import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/axios";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const query = new URLSearchParams(searchParams).toString();

    try {
        const response = await api.get(`/orders/user?${query}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
