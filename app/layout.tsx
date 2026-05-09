import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIWander",
  description: "AI agent chat with live browser preview",
};

// Force dynamic rendering — the root page is a client component with
// streaming chat / live state. Static prerender produced a shell that
// curl accepted but real browsers couldn't hydrate (Chrome / Edge would
// time out with "This page couldn't load" while curl returned 200).
// force-dynamic makes Vercel serve a fresh render every request.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
