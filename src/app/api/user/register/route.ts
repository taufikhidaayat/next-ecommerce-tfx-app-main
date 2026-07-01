import { NextRequest, NextResponse } from "next/server";
import { AxiosError } from "axios";
import { api } from "@/lib/axios";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const response = await api.post(`/user/register`, body);

        return NextResponse.json(
            {
                status: "success",
                data: response.data,
            },
            { status: 200 }
        );
    } catch (err: unknown) {
        console.error("Registration error:", err);

        if (err instanceof AxiosError) {
            return NextResponse.json(
                {
                    status: "error",
                    message: err.response?.data?.message || "Registration failed",
                },
                { status: err.response?.status || 500 }
            );
        }

        return NextResponse.json(
            { status: "error", message: "Unexpected error" },
            { status: 500 }
        );
    }
}