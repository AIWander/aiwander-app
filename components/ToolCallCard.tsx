"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ToolCallCardProps {
  name: string;
  iteration: number;
  args: string;
  result?: { ok: boolean; content: string } | null;
}

export function ToolCallCard({ name, iteration, args, result }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(false);

  let formattedArgs = args;
  try {
    formattedArgs = JSON.stringify(JSON.parse(args), null, 2);
  } catch {
    // keep raw
  }

  const truncatedResult =
    result?.content && result.content.length > 500 && !expanded
      ? result.content.slice(0, 500) + "..."
      : result?.content;

  return (
    <div className="my-1.5 rounded-md border border-border bg-card p-2">
      <button
        className="flex w-full items-center gap-2 text-left text-xs"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3 shrink-0" />
        ) : (
          <ChevronRight className="h-3 w-3 shrink-0" />
        )}
        <code className="font-mono text-xs text-muted-foreground">{name}</code>
        <Badge variant="secondary" className="ml-auto text-[10px]">
          iter {iteration}
        </Badge>
        {result && (
          <Badge
            variant={result.ok ? "default" : "destructive"}
            className="text-[10px]"
          >
            {result.ok ? "ok" : "err"}
          </Badge>
        )}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          <div>
            <p className="mb-0.5 text-[10px] font-medium text-muted-foreground">
              Arguments
            </p>
            <pre className="max-h-40 overflow-auto rounded bg-muted p-1.5 text-[11px]">
              {formattedArgs}
            </pre>
          </div>
          {result && (
            <div>
              <p className="mb-0.5 text-[10px] font-medium text-muted-foreground">
                Result
              </p>
              <pre className="max-h-60 overflow-auto whitespace-pre-wrap rounded bg-muted p-1.5 text-[11px]">
                {truncatedResult}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
