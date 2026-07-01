import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/lib/axios";

export async function POST(req: NextRequest) {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    try {
        const response = await api.post(`/review-reports`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return NextResponse.json(response.data, { status: response.status });
    } catch (error: any) {
        console.error("Error submitting review report:", error?.response?.data || error);
        const status = error?.response?.status || 500;
        const data = error?.response?.data || { message: "Internal Server Error" };
        return NextResponse.json(data, { status });
    }
}
