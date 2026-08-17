import * as Sentry from "@sentry/nextjs";

export function reportServerError(error, context = {}) {
    console.error(context.message ?? "Unhandled server error", error);
    if (process.env.SENTRY_DSN)
        Sentry.captureException(error, { extra: context });
}
