import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    // Example: you can enforce auth on specific routes server-side later if needed
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard",
    ],
};


