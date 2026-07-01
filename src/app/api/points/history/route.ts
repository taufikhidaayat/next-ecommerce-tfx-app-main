import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/axios";
import { cookies } from "next/headers";
import { AxiosError } from "axios";

export async function GET(req: NextRequest) {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const query = new URLSearchParams(searchParams).toString();

    try {
        const response = await api.get(`/points/history?${query}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        if (error instanceof AxiosError) {
            return NextResponse.json(
                { message: error.response?.data?.message || "Internal Server Error" },
                { status: error.response?.status || 500 }
            );
        }
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
