import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/axios";
import { cookies } from "next/headers";
import { AxiosError } from "axios";

export async function PUT(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const response = await api.put(
            `/orders/cancel/${id}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        const err = error as AxiosError<{ message?: string }>;
        const status = err?.response?.status || 500;
        const message = err?.response?.data?.message || "Failed to cancel order";
        return NextResponse.json({ message }, { status });
    }
}
