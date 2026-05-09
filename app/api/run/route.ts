import { DRIVER_URL, driverHeaders } from "@/lib/driver";

export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(`${DRIVER_URL}/run`, {
    method: "POST",
    headers: driverHeaders({ "content-type": "application/json" }),
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
