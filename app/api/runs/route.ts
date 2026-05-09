import { type NextRequest } from "next/server";

const DRIVER = process.env.DRIVER_URL || "http://129.212.181.146:8009";

export async function GET(request: NextRequest) {
  const limit = request.nextUrl.searchParams.get("limit") || "10";
  const offset = request.nextUrl.searchParams.get("offset") || "0";
  const res = await fetch(`${DRIVER}/runs?limit=${limit}&offset=${offset}`, { cache: "no-store" });
  const data = await res.json();
  return Response.json(data);
}
