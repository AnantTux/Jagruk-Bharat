import { NextResponse } from "next/server";

function firstForwardedValue(value) {
    return value?.split(",")[0]?.trim() || null;
}

function publicOrigin(request) {
    const requestUrl = new URL(request.url);
    const forwardedHost = firstForwardedValue(request.headers.get("x-forwarded-host"));
    const forwardedProtocol = firstForwardedValue(request.headers.get("x-forwarded-proto"));
    const host = forwardedHost ?? request.headers.get("host") ?? requestUrl.host;
    const protocol = forwardedProtocol ?? requestUrl.protocol.replace(/:$/, "");

    return `${protocol}://${host}`;
}

/** Reject browser cross-site requests that could carry a session cookie. */
export function requireSameOrigin(request) {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    // A reverse proxy such as Render terminates HTTPS before forwarding the
    // request to this Node server. Use its public origin for CSRF validation.
    const expectedOrigin = publicOrigin(request);

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
