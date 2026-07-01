import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url || typeof url !== "string") {
            return NextResponse.json({ message: "URL is required" }, { status: 400 });
        }

        // Use GET with redirect:"follow" to resolve all redirects (short links may have multiple hops)
        const response = await fetch(url, {
            method: "GET",
            redirect: "follow",
            headers: {
                "User-Agent": "Mozilla/5.0",
            },
        });

        // The final URL after all redirects
        const resolvedUrl = response.url;

        return NextResponse.json({ resolvedUrl });
    } catch {
        return NextResponse.json({ message: "Failed to resolve URL" }, { status: 500 });
    }
}
