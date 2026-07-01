import { api } from "@/lib/axios";
import { AxiosError } from "axios";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const response = await api.post("/user/reset-password", body);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (err: unknown) {
        if (err instanceof AxiosError) {
            return NextResponse.json(
                {
                    status: "error",
                    message: err.response?.data?.message || "Password reset failed",
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
