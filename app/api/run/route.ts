const DRIVER = process.env.DRIVER_URL || "http://129.212.181.146:8009";

export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(`${DRIVER}/run`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) {
    return new Response(res.statusText, { status: res.status });
  }

  return new Response(res.body, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      connection: "keep-alive",
    },
  });
}
