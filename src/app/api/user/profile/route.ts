import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/axios";
import { UserResponse } from "@/types/user/userResponse";
import { cookies } from "next/headers";
import { locales } from "@/lib/i18n";

export async function GET() {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const response = await api.get<UserResponse>(
            `/user/profile`,
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
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();

        const response = await api.put(
            `/user/profile`,
            body,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            }
        );

        const newLanguage = response.data.data.languagePreference;

        const res = NextResponse.json(response.data, {
            status: response.status,
        });

        if (newLanguage && locales.includes(newLanguage)) {
            res.cookies.set("language", newLanguage, {
                path: "/",
                maxAge: 60 * 60 * 24, // 1 day
                sameSite: "lax",
            });
        }

        return res;
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}