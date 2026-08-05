import { EventEmitter } from "node:events";

const globalEvents = globalThis;
const hazardEvents = globalEvents.__jagrukBharatHazardEvents ?? new EventEmitter();

if (!globalEvents.__jagrukBharatHazardEvents) {
    globalEvents.__jagrukBharatHazardEvents = hazardEvents;
    hazardEvents.setMaxListeners(0);
}

export function publishHazardUpdate(details = {}) {
    const event = {
        type: "hazards-updated",
        at: Date.now(),
        ...details,
    };

    hazardEvents.emit("hazards-updated", event);
    globalEvents.__broadcastHazardUpdate?.(event);
}

export function waitForHazardUpdate({ timeoutMs = 25000, signal } = {}) {
    return new Promise((resolve) => {
        let settled = false;

        const finish = (event) => {
            if (settled)
                return;
            settled = true;
            clearTimeout(timeout);
            hazardEvents.off("hazards-updated", onUpdate);
            signal?.removeEventListener("abort", onAbort);
            resolve(event);
        };

        const onUpdate = (event) => finish(event);
        const onAbort = () => finish({ type: "aborted" });
        const timeout = setTimeout(() => finish({ type: "timeout" }), timeoutMs);

        hazardEvents.once("hazards-updated", onUpdate);
        if (signal?.aborted) {
            onAbort();
        }
        else {
            signal?.addEventListener("abort", onAbort, { once: true });
        }
    });
}
