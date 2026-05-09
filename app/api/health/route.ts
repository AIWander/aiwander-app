import { DRIVER_URL, driverHeaders } from "@/lib/driver";

export async function GET() {
  const res = await fetch(`${DRIVER_URL}/health`, {
    cache: "no-store",
    headers: driverHeaders(),
  });
  const data = await res.json();
  return Response.json(data);
}
