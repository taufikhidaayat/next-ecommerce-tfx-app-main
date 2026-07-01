import { api } from "@/lib/axios";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
        return NextResponse.json(
            { message: "Missing token" },
            { status: 400 }
        );
    }

    try {
        const response = await api.get(`/user/reset-password/verify?token=${token}`);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("Error verifying reset token:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
