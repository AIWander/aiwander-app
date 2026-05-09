// Driver endpoint config + shared headers.
// DRIVER_URL is a Vercel env var; the fallback is the public HTTPS ngrok tunnel
// for the AIWander hackathon droplet. The ngrok-skip-browser-warning header
// bypasses ngrok-free's interstitial warning page.

export const DRIVER_URL =
  process.env.DRIVER_URL || "https://heartaching-beakless-yanira.ngrok-free.dev";

export function driverHeaders(extra?: Record<string, string>): HeadersInit {
  return {
    "ngrok-skip-browser-warning": "true",
    ...(extra || {}),
  };
}
