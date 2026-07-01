import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/axios";
import { cookies } from "next/headers";
import { AxiosError } from "axios";

export async function PUT(req: NextRequest) {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();

        const response = await api.put(
            `/user/change-password`,
            body,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            return NextResponse.json(
                { message: error.response.data?.message || "Failed to change password" },
                { status: error.response.status }
            );
        }
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
