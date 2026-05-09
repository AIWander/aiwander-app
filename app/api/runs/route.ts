import { type NextRequest } from "next/server";
import { DRIVER_URL, driverHeaders } from "@/lib/driver";

export async function GET(request: NextRequest) {
  const limit = request.nextUrl.searchParams.get("limit") || "10";
  const offset = request.nextUrl.searchParams.get("offset") || "0";
  const res = await fetch(`${DRIVER_URL}/runs?limit=${limit}&offset=${offset}`, {
    cache: "no-store",
    headers: driverHeaders(),
  });
  const data = await res.json();
  return Response.json(data);
}
