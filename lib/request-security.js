import { NextResponse } from "next/server";

/** Reject browser cross-site requests that could carry a session cookie. */
export function requireSameOrigin(request) {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    const expectedOrigin = new URL(request.url).origin;

    if (origin)
        return origin === expectedOrigin ? null : NextResponse.json({ error: "Cross-site request blocked." }, { status: 403 });
    if (referer) {
        try {
            return new URL(referer).origin === expectedOrigin
                ? null
                : NextResponse.json({ error: "Cross-site request blocked." }, { status: 403 });
        }
        catch {
            return NextResponse.json({ error: "Cross-site request blocked." }, { status: 403 });
        }
    }

    // Non-browser clients do not send Origin. Production browser requests do.
    return process.env.NODE_ENV === "production"
        ? NextResponse.json({ error: "Missing request origin." }, { status: 403 })
        : null;
}
