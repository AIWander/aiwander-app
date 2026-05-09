"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, ChevronDown } from "lucide-react";
import { parseSSE } from "@/lib/sse";
import { parseHarmony } from "@/lib/harmony";
import type { Event, RegistryModel } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";
import { ToolCallCard } from "./ToolCallCard";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  reasoning?: string;
  toolCalls?: ToolCallEntry[];
  duration?: number;
  tokens?: number;
}

interface ToolCallEntry {
  id: string;
  name: string;
  iteration: number;
  args: string;
  result?: { ok: boolean; content: string };
}

interface ChatProps {
  onStreamingChange?: (streaming: boolean) => void;
  onBrowserAction?: (url?: string) => void;
  onToolCall?: (tc: ToolCallEntry) => void;
  onToolResult?: (id: string, result: { ok: boolean; content: string }) => void;
  onReasoning?: (r: { iteration: number; content: string }) => void;
  onRunStart?: () => void;
  onRunEnd?: () => void;
}

export function Chat({
  onStreamingChange,
  onBrowserAction,
  onToolCall,
  onToolResult,
  onReasoning,
  onRunStart,
  onRunEnd,
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingToolCalls, setPendingToolCalls] = useState<ToolCallEntry[]>([]);
  const [pendingReasoning, setPendingReasoning] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-oss-20b");
  const [models, setModels] = useState<RegistryModel[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/registry")
      .then((r) => r.json())
      .then((data) => {
        if (data.models) setModels(data.models);
      })
      .catch(() => {});
  }, []);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, []);

  const setStreamingState = useCallback(
    (v: boolean) => {
      setIsStreaming(v);
      onStreamingChange?.(v);
    },
    [onStreamingChange]
  );

  const handleSubmit = async () => {
    const prompt = input.trim();
    if (!prompt || isStreaming) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    setPendingToolCalls([]);
    setPendingReasoning([]);
    setStreamingState(true);
    onRunStart?.();
    scrollToBottom();

    const currentToolCalls: ToolCallEntry[] = [];
    const currentReasoning: string[] = [];
    let finalContent = "";
    let finalReasoningContent = "";
    let duration = 0;
    let tokens = 0;

    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          user_prompt: prompt,
          model: selectedModel,
        }),
      });

      if (!res.ok || !res.body) {
        setMessages((prev) => [
          ...prev,
          { role: "system", content: `Error: ${res.status} ${res.statusText}` },
        ]);
        setStreamingState(false);
        onRunEnd?.();
        return;
      }

      for await (const event of parseSSE(res.body)) {
        switch (event.kind) {
          case "tool_call": {
            const tc: ToolCallEntry = {
              id: event.id,
              name: event.name,
              iteration: event.iteration,
              args: event.arguments,
            };
            currentToolCalls.push(tc);
            setPendingToolCalls([...currentToolCalls]);
            onToolCall?.(tc);
            if (event.name.includes("browser_navigate")) {
              try {
                const parsed = JSON.parse(event.arguments);
                if (parsed.url) onBrowserAction?.(parsed.url);
              } catch {}
            }
            break;
          }
          case "tool_result": {
            const result = { ok: event.ok, content: event.content };
            const idx = currentToolCalls.findIndex((tc) => tc.id === event.id);
            if (idx >= 0) {
              currentToolCalls[idx] = { ...currentToolCalls[idx], result };
              setPendingToolCalls([...currentToolCalls]);
            }
            onToolResult?.(event.id, result);
            break;
          }
          case "llm_response": {
            if (event.reasoning) {
              currentReasoning.push(event.reasoning);
              setPendingReasoning([...currentReasoning]);
              onReasoning?.({
                iteration: event.iteration,
                content: event.reasoning,
              });
            }
            break;
          }
          case "final_answer": {
            const harmony = parseHarmony(event.content);
            finalContent = harmony.answer;
            if (harmony.reasoning) {
              finalReasoningContent = harmony.reasoning;
            }
            break;
          }
          case "run_end": {
            duration = event.duration_ms;
            tokens = event.total_tokens;
            if (event.error && !finalContent) {
              finalContent = `Run error: ${event.error}`;
            }
            break;
          }
          case "error": {
            setMessages((prev) => [
              ...prev,
              { role: "system", content: `Error: ${event.error}` },
            ]);
            break;
          }
        }
        scrollToBottom();
      }

      if (finalContent) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: finalContent,
            reasoning:
              finalReasoningContent || currentReasoning.join("\n\n") || undefined,
            toolCalls: currentToolCalls.length > 0 ? currentToolCalls : undefined,
            duration,
            tokens,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: `Connection error: ${err instanceof Error ? err.message : "unknown"}`,
        },
      ]);
    } finally {
      setPendingToolCalls([]);
      setPendingReasoning([]);
      setStreamingState(false);
      onRunEnd?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-lg font-semibold text-foreground">AIWander</p>
            <p className="text-sm text-muted-foreground">
              Send a message to start an agent run
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i}>
            <MessageBubble role={msg.role} content={msg.content} />
            {msg.reasoning && (
              <details className="mb-2 ml-10 rounded-md border border-border p-2">
                <summary className="cursor-pointer text-xs text-muted-foreground">
                  Thinking
                </summary>
                <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">
                  {msg.reasoning}
                </p>
              </details>
            )}
            {msg.toolCalls && msg.toolCalls.length > 0 && (
              <details className="mb-2 ml-10 rounded-md border border-border p-2">
                <summary className="cursor-pointer text-xs text-muted-foreground">
                  {msg.toolCalls.length} tool call{msg.toolCalls.length > 1 ? "s" : ""}
                </summary>
                <div className="mt-1">
                  {msg.toolCalls.map((tc) => (
                    <ToolCallCard
                      key={tc.id}
                      name={tc.name}
                      iteration={tc.iteration}
                      args={tc.args}
                      result={tc.result}
                    />
                  ))}
                </div>
              </details>
            )}
            {msg.duration !== undefined && msg.duration > 0 && (
              <p className="mb-2 ml-10 text-[10px] text-muted-foreground">
                {(msg.duration / 1000).toFixed(1)}s
                {msg.tokens ? ` · ${msg.tokens.toLocaleString()} tokens` : ""}
              </p>
            )}
          </div>
        ))}

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="space-y-1 py-2">
            {pendingToolCalls.map((tc) => (
              <ToolCallCard
                key={tc.id}
                name={tc.name}
                iteration={tc.iteration}
                args={tc.args}
                result={tc.result}
              />
            ))}
            {pendingReasoning.length > 0 && (
              <details open className="rounded-md border border-border p-2">
                <summary className="cursor-pointer text-xs text-muted-foreground">
                  Thinking...
                </summary>
                <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">
                  {pendingReasoning[pendingReasoning.length - 1]?.slice(0, 500)}
                </p>
              </details>
            )}
            <div className="flex items-center gap-2 px-2 py-1">
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Agent working...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border p-3">
        <div className="mb-2 flex items-center gap-2">
          <label className="text-[10px] text-muted-foreground">Model:</label>
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="appearance-none rounded-md border border-border bg-background px-2 py-1 pr-6 font-mono text-[11px] text-foreground"
            >
              {models.length > 0 ? (
                models.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))
              ) : (
                <option value="gpt-oss-20b">gpt-oss-20b</option>
              )}
            </select>
            <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            className="min-h-[40px] resize-none text-sm"
            rows={1}
            disabled={isStreaming}
          />
          <button
            onClick={handleSubmit}
            disabled={isStreaming || !input.trim()}
            className="shrink-0 rounded-md bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
