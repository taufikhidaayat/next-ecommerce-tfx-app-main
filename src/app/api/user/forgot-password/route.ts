import { api } from "@/lib/axios";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const response = await api.post("/user/forgot-password", body);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("Error requesting forgot password:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
