import { NextResponse } from "next/server";
import { api } from "@/lib/axios";

export async function GET() {
    try {
        const response = await api.get(`/announcements/active`);

        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        console.error("Error fetching announcements:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
