import { api } from "@/lib/axios";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await api.get(`/store-settings`);

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("Error fetching store settings:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
