"use client";

import dynamic from "next/dynamic";

// Force client-only rendering. Server emits a tiny shell, client
// downloads and hydrates ClientHome. This bypasses the SSR path
// entirely — no streaming RSC, no __next_error__ on navigation.
//
// Background: even with `dynamic = "force-dynamic"`, top-level
// Chromium navigation receives _global-error.html (9 KB) while
// curl + fetch() both receive the working 16 KB page. The
// differentiator is something in the SSR streaming path. Skipping
// SSR for the entire app (it's all client-interactive anyway)
// makes the response identical for navigation, fetch, and curl.
const ClientHome = dynamic(() => import("./ClientHome"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#0a0a0a",
        color: "#fafafa",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div style={{ opacity: 0.7 }}>Loading AIWander…</div>
    </div>
  ),
});

export default function Page() {
  return <ClientHome />;
}
