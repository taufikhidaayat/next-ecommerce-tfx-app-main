import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/lib/axios";
import { AxiosError } from "axios";

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await params;

    try {
        const response = await api.delete(`/wishlist/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        const err = error as AxiosError;
        const status = err?.response?.status ?? 500;
        const data = err?.response?.data ?? { message: "Internal Server Error" };
        return NextResponse.json(data, { status });
    }
}
