import ClientHome from "./ClientHome";

// Server-component shell. Forces dynamic rendering so Vercel doesn't
// serve a stale prerendered shell with broken hydration. The actual UI
// is in ClientHome.tsx (which has "use client").
//
// Why: client component as the root page caused Vercel to cache a static
// prerender that browsers couldn't hydrate ("This page couldn't load"
// while curl returned valid HTML). Wrapping in a server component +
// force-dynamic eliminates both the broken prerender and the
// Content-Disposition: inline header that Chromium choked on.
export const dynamic = "force-dynamic";

export default function Page() {
  return <ClientHome />;
}
