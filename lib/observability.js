import { trace } from "@opentelemetry/api";

const tracer = trace.getTracer("jagruk-bharat");

export async function traceOperation(name, operation) {
    return tracer.startActiveSpan(name, async (span) => {
        try {
            const result = await operation();
            span.setAttribute("app.operation.outcome", "success");
            return result;
        }
        catch (error) {
            span.recordException(error);
            span.setAttribute("app.operation.outcome", "error");
            throw error;
        }
        finally {
            span.end();
        }
    });
}
