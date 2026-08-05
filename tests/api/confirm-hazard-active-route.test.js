import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/auth", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/hazard-store", () => ({ confirmHazardActive: vi.fn() }));

import { getCurrentUser } from "@/lib/auth";
import { confirmHazardActive } from "@/lib/hazard-store";
import { POST } from "@/app/api/hazards/[id]/confirm-active/route";

describe("/api/hazards/[id]/confirm-active", () => {
    beforeEach(() => vi.resetAllMocks());

    test("extends an active report only for its original reporter", async () => {
        getCurrentUser.mockResolvedValue({ _id: "user-1" });
        confirmHazardActive.mockResolvedValue({ id: "hazard-1", status: "active" });

        const response = await POST(new Request("http://localhost"), {
            params: Promise.resolve({ id: "hazard-1" }),
        });

        expect(response.status).toBe(200);
        expect(confirmHazardActive).toHaveBeenCalledWith("hazard-1", "user-1");
    });
});
