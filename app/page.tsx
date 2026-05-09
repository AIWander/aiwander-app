"use client";

import { useState, useCallback } from "react";
import { Dashboard } from "@/components/Dashboard";
import { Chat } from "@/components/Chat";
import { BrowserPane } from "@/components/BrowserPane";

interface LiveToolCall {
  id: string;
  name: string;
  iteration: number;
  args: string;
  result?: { ok: boolean; content: string };
}

export default function Home() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastBrowserUrl, setLastBrowserUrl] = useState<string | undefined>();
  const [liveToolCalls, setLiveToolCalls] = useState<LiveToolCall[]>([]);
  const [liveReasoning, setLiveReasoning] = useState<
    { iteration: number; content: string }[]
  >([]);

  const handleRunStart = useCallback(() => {
    setLiveToolCalls([]);
    setLiveReasoning([]);
  }, []);

  const handleToolCall = useCallback((tc: LiveToolCall) => {
    setLiveToolCalls((prev) => [...prev, tc]);
  }, []);

  const handleToolResult = useCallback(
    (id: string, result: { ok: boolean; content: string }) => {
      setLiveToolCalls((prev) =>
        prev.map((tc) => (tc.id === id ? { ...tc, result } : tc))
      );
    },
    []
  );

  const handleReasoning = useCallback(
    (r: { iteration: number; content: string }) => {
      setLiveReasoning((prev) => [...prev, r]);
    },
    []
  );

  return (
    <div className="flex h-screen flex-col lg:flex-row">
      {/* Left: Dashboard (33%) */}
      <aside className="order-3 h-64 shrink-0 overflow-hidden border-t border-border lg:order-1 lg:h-full lg:w-1/3 lg:border-r lg:border-t-0">
        <Dashboard
          liveToolCalls={liveToolCalls}
          liveReasoning={liveReasoning}
          isRunning={isStreaming}
        />
      </aside>

      {/* Right (67%): Browser top + Chat bottom */}
      <main className="flex min-h-0 flex-1 flex-col lg:order-2">
        {/* Browser pane (top half on desktop, collapsible on mobile) */}
        <div className="hidden h-1/2 lg:block">
          <BrowserPane
            isStreaming={isStreaming}
            lastBrowserUrl={lastBrowserUrl}
          />
        </div>

        {/* Mobile browser toggle */}
        <div className="lg:hidden">
          <details className="border-b border-border">
            <summary className="cursor-pointer px-3 py-2 text-xs text-muted-foreground">
              Browser Preview
            </summary>
            <div className="h-64">
              <BrowserPane
                isStreaming={isStreaming}
                lastBrowserUrl={lastBrowserUrl}
              />
            </div>
          </details>
        </div>

        {/* Chat pane (bottom half on desktop, main content on mobile) */}
        <div className="order-1 min-h-0 flex-1 lg:order-2 lg:border-t lg:border-border">
          <Chat
            onStreamingChange={setIsStreaming}
            onBrowserAction={setLastBrowserUrl}
            onToolCall={handleToolCall}
            onToolResult={handleToolResult}
            onReasoning={handleReasoning}
            onRunStart={handleRunStart}
            onRunEnd={() => {}}
          />
        </div>
      </main>
    </div>
  );
}
