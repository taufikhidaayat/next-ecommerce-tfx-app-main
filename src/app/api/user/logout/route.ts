import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    (await cookies()).set({
        name: 'token',
        value: '',
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        expires: new Date(0),
    });

    (await cookies()).set({
        name: 'language',
        value: '',
        path: '/',
        sameSite: 'lax',
        expires: new Date(0),
    });

    return NextResponse.json({ message: 'You’ve been successfully logged out.' });
}