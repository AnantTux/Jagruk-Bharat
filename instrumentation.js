export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        await import("./sentry.server.config.js");
        if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
            const { NodeSDK } = await import("@opentelemetry/sdk-node");
            const { getNodeAutoInstrumentations } = await import("@opentelemetry/auto-instrumentations-node");
            const globalForTelemetry = globalThis;
            if (!globalForTelemetry.__jagrukBharatTelemetry) {
                const sdk = new NodeSDK({ instrumentations: [getNodeAutoInstrumentations()] });
                sdk.start();
                globalForTelemetry.__jagrukBharatTelemetry = sdk;
            }
        }
    }
    if (process.env.NEXT_RUNTIME === "edge")
        await import("./sentry.edge.config.js");
}

export async function onRequestError(...args) {
    const { captureRequestError } = await import("@sentry/nextjs");
    captureRequestError(...args);
}
