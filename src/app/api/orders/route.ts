import { api } from "@/lib/axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();

        const response = await api.post(
            `/orders`,
            body,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            }
        );

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}