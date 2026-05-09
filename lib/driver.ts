// Driver endpoint config + shared headers.
// DRIVER_URL is a Vercel env var; the fallback is the public HTTPS ngrok tunnel
// for the AIWander hackathon droplet (custom-domain dedicated to driver).
// The ngrok-skip-browser-warning header bypasses ngrok's interstitial page.

export const DRIVER_URL =
  process.env.DRIVER_URL || "https://aiwander.ngrok.dev";

export function driverHeaders(extra?: Record<string, string>): HeadersInit {
  return {
    "ngrok-skip-browser-warning": "true",
    ...(extra || {}),
  };
}
