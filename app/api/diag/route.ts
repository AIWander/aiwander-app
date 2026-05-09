import { DRIVER_URL, driverHeaders } from "@/lib/driver";

// Diagnostic: surface the actual error when Vercel server-side fetch fails.
// Useful for debugging things like ngrok TLS rejects, DNS failures,
// timeout-vs-block, etc. The /api/health route just 500s opaquely.
export async function GET() {
  const target = `${DRIVER_URL}/health`;
  const start = Date.now();
  try {
    const res = await fetch(target, {
      cache: "no-store",
      headers: driverHeaders(),
    });
    const text = await res.text();
    return Response.json({
      ok: true,
      target,
      status: res.status,
      duration_ms: Date.now() - start,
      body_preview: text.slice(0, 400),
      response_headers: Object.fromEntries(res.headers.entries()),
    });
  } catch (err) {
    return Response.json(
      {
        ok: false,
        target,
        duration_ms: Date.now() - start,
        error: String(err),
        error_name: err instanceof Error ? err.name : undefined,
        error_cause: err instanceof Error ? String(err.cause) : undefined,
      },
      { status: 200 } // 200 so Vercel doesn't hide the body behind its own error page
    );
  }
}
