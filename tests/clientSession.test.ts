import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

describe("shared session lookup", () => {
  it("shares one request between widgets in the same navigation", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ signedIn: true, role: "TRAINEE" }) });
    vi.stubGlobal("fetch", fetcher);
    const { loadSessionSummary } = await import("@/lib/clientSession");
    const [a, b] = await Promise.all([loadSessionSummary("/"), loadSessionSummary("/")]);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(a).toEqual(b);
    expect(a.role).toBe("TRAINEE");
  });

  it("rechecks identity after navigating away and returning", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ signedIn: false }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ signedIn: false }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ signedIn: true, role: "TRAINEE" }) });
    vi.stubGlobal("fetch", fetcher);
    const { loadSessionSummary } = await import("@/lib/clientSession");
    await loadSessionSummary("/");
    await loadSessionSummary("/trainee/login");
    expect((await loadSessionSummary("/")).signedIn).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it("allows retry after a temporary server failure", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ signedIn: true }) });
    vi.stubGlobal("fetch", fetcher);
    const { loadSessionSummary } = await import("@/lib/clientSession");
    expect((await loadSessionSummary("/")).signedIn).toBe(false);
    expect((await loadSessionSummary("/")).signedIn).toBe(true);
  });
});
