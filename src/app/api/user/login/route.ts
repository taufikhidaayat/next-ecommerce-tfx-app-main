import { NextRequest, NextResponse } from "next/server";
import { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { serialize } from "cookie";
import { locales, defaultLocale } from "@/lib/i18n";

export async function POST(req: NextRequest) {
    const body = await req.json();
    try {
        const response = await api.post(
            `/user/login`,
            body
        );
        const token = response.data.token;

        // Prioritas: cookie language yang sudah ada (locale aktif sebelum login) → backend → default
        const currentCookieLanguage = req.cookies.get("language")?.value;
        const validCurrentCookie = currentCookieLanguage && locales.includes(currentCookieLanguage as typeof locales[number])
            ? currentCookieLanguage
            : undefined;
        const userLanguage = response.data.language;
        const validUserLanguage = locales.includes(userLanguage) ? userLanguage : undefined;
        const finalLanguage = validCurrentCookie || validUserLanguage || defaultLocale;

        const res = NextResponse.json(
            { status: "success", data: { ...response.data, language: finalLanguage } },
            { status: 200 }
        );

        res.headers.append('Set-Cookie',
            serialize('token', token, {
                httpOnly: true,
                path: '/',
                maxAge: 60 * 60 * 24,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            })
        );

        res.headers.append('Set-Cookie',
            serialize('language', finalLanguage, {
                path: '/',
                maxAge: 60 * 60 * 24,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            })
        );

        return res;
    } catch (err: unknown) {
        if (err instanceof AxiosError) {
            return NextResponse.json(
                {
                    status: "error",
                    message: err.response?.data?.message || "Login failed"
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