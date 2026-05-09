"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
}

const roleConfig = {
  user: { label: "You", color: "bg-primary text-primary-foreground" },
  assistant: { label: "AI", color: "bg-secondary text-secondary-foreground" },
  system: { label: "Sys", color: "bg-muted text-muted-foreground" },
};

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const config = roleConfig[role];
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3 py-2", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-medium",
          config.color
        )}
      >
        {config.label}
      </div>
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none [&_pre]:bg-background/50 [&_pre]:p-2 [&_pre]:rounded [&_code]:text-xs">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
