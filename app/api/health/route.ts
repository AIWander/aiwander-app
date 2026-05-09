const DRIVER = process.env.DRIVER_URL || "http://129.212.181.146:8009";

export async function GET() {
  const res = await fetch(`${DRIVER}/health`, { cache: "no-store" });
  const data = await res.json();
  return Response.json(data);
}
