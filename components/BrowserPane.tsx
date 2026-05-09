"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Globe, ChevronUp, ChevronDown, ExternalLink } from "lucide-react";

interface BrowserPaneProps {
  isStreaming: boolean;
  lastBrowserUrl?: string;
}

const NOVNC_URL = "http://129.212.181.146:6080/vnc.html?autoconnect=1&resize=remote&view_only=1";

export function BrowserPane({ isStreaming, lastBrowserUrl }: BrowserPaneProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";

  return (
    <div className={`flex flex-col border-b border-border ${collapsed ? "h-10" : "h-full"}`}>
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-1.5">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium">Live Browser</span>
        {isStreaming && (
          <Badge variant="default" className="text-[10px]">
            streaming
          </Badge>
        )}
        <div className="ml-auto flex items-center gap-1">
          <a
            href={NOVNC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-1 hover:bg-muted"
            title="Open in new tab"
          >
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </a>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded p-1 hover:bg-muted"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {lastBrowserUrl && !collapsed && (
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-3 py-1">
          <Globe className="h-3 w-3 shrink-0 text-muted-foreground" />
          <span className="truncate font-mono text-[11px] text-muted-foreground">
            {lastBrowserUrl}
          </span>
        </div>
      )}

      {!collapsed && (
        <div className="flex-1 overflow-hidden">
          {isHttps || iframeError ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-muted/30 p-6 text-center">
              <Globe className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {isHttps
                  ? "Live browser preview unavailable over HTTPS (mixed content)."
                  : "Browser preview could not load."}
              </p>
              <a
                href={NOVNC_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Open in new tab
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : (
            <iframe
              src={NOVNC_URL}
              className="h-full w-full border-0"
              title="Live browser view via noVNC"
              sandbox="allow-scripts allow-same-origin"
              onError={() => setIframeError(true)}
            />
          )}
        </div>
      )}
    </div>
  );
}
