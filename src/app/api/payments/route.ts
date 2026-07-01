import { api } from "@/lib/axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const orderId = formData.get("orderId")?.toString();

        if (!file || !orderId) {
            return NextResponse.json({ message: "Missing file or orderId" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();

        const backendForm = new FormData();
        backendForm.append("file", new Blob([arrayBuffer]), file.name);
        backendForm.append("orderId", orderId);

        const response = await api.post("/payments", backendForm, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });

        return NextResponse.json(response.data, { status: response.status });
    } catch (err) {
        console.error("Upload Payment Error:", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
