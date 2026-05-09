"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Activity,
  Server,
  Cpu,
  Clock,
  ChevronDown,
  ChevronRight,
  Wrench,
  History,
  Loader2,
} from "lucide-react";
import type {
  HealthResponse,
  RegistryResponse,
  RunSummary,
} from "@/lib/types";
import { ToolCallCard } from "./ToolCallCard";

interface LiveToolCall {
  id: string;
  name: string;
  iteration: number;
  args: string;
  result?: { ok: boolean; content: string };
}

interface DashboardProps {
  liveToolCalls: LiveToolCall[];
  liveReasoning: { iteration: number; content: string }[];
  isRunning: boolean;
}

function formatUptime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function Dashboard({ liveToolCalls, liveReasoning, isRunning }: DashboardProps) {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [registry, setRegistry] = useState<RegistryResponse | null>(null);
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [registryOpen, setRegistryOpen] = useState(false);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [expandedRunEvents, setExpandedRunEvents] = useState<unknown[]>([]);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/health");
      if (res.ok) setHealth(await res.json());
    } catch {
      // silent
    }
  }, []);

  const fetchRegistry = useCallback(async () => {
    try {
      const res = await fetch("/api/registry");
      if (res.ok) setRegistry(await res.json());
    } catch {
      // silent
    }
  }, []);

  const fetchRuns = useCallback(async () => {
    try {
      const res = await fetch("/api/runs?limit=10");
      if (res.ok) {
        const data = await res.json();
        setRuns(Array.isArray(data) ? data : data.runs || []);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    fetchRegistry();
    fetchRuns();
    const interval = setInterval(fetchHealth, 5000);
    const runsInterval = setInterval(fetchRuns, 10000);
    return () => {
      clearInterval(interval);
      clearInterval(runsInterval);
    };
  }, [fetchHealth, fetchRegistry, fetchRuns]);

  const loadRunEvents = async (runId: string) => {
    if (expandedRun === runId) {
      setExpandedRun(null);
      return;
    }
    try {
      const res = await fetch(`/api/runs?limit=1&offset=0`);
      // TODO: individual run endpoint /api/runs/:id
      setExpandedRun(runId);
      if (res.ok) {
        setExpandedRunEvents([]);
      }
    } catch {
      setExpandedRun(runId);
      setExpandedRunEvents([]);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Activity className="h-4 w-4" />
          Operations
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Health pills */}
        <div className="border-b border-border p-3">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Driver Health
          </p>
          {health ? (
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {health.status}
              </Badge>
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <Clock className="h-3 w-3" />
                {formatUptime(health.uptime_secs)}
              </Badge>
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <Cpu className="h-3 w-3" />
                {health.registered_models} models
              </Badge>
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <Server className="h-3 w-3" />
                {health.registered_servers} servers
              </Badge>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Connecting...
            </div>
          )}
        </div>

        {/* Live run */}
        {isRunning && (
          <div className="border-b border-border p-3">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Live Run
            </p>
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {liveToolCalls.map((tc) => (
                <ToolCallCard
                  key={tc.id}
                  name={tc.name}
                  iteration={tc.iteration}
                  args={tc.args}
                  result={tc.result}
                />
              ))}
              {liveReasoning.length > 0 && (
                <details className="rounded-md border border-border p-2">
                  <summary className="cursor-pointer text-[10px] text-muted-foreground">
                    Reasoning ({liveReasoning.length} chunks)
                  </summary>
                  <div className="mt-1 max-h-32 overflow-y-auto">
                    {liveReasoning.map((r, i) => (
                      <p key={i} className="text-[11px] text-muted-foreground">
                        <span className="font-medium">iter {r.iteration}:</span>{" "}
                        {r.content.slice(0, 200)}
                        {r.content.length > 200 ? "..." : ""}
                      </p>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        )}

        {/* Run history */}
        <div className="border-b border-border p-3">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <History className="h-3 w-3" />
            Recent Runs
          </p>
          {runs.length === 0 ? (
            <p className="text-xs text-muted-foreground">No runs yet</p>
          ) : (
            <div className="space-y-1">
              {runs.map((run) => (
                <button
                  key={run.id}
                  onClick={() => loadRunEvents(run.id)}
                  className="flex w-full items-center gap-2 rounded-md p-1.5 text-left text-xs hover:bg-muted"
                >
                  {expandedRun === run.id ? (
                    <ChevronDown className="h-3 w-3 shrink-0" />
                  ) : (
                    <ChevronRight className="h-3 w-3 shrink-0" />
                  )}
                  <span className="truncate font-mono text-[10px]">
                    {run.id.slice(0, 8)}
                  </span>
                  <span className="truncate text-muted-foreground">
                    {run.task || run.model}
                  </span>
                  {run.ok !== undefined && (
                    <Badge
                      variant={run.ok ? "default" : "destructive"}
                      className="ml-auto shrink-0 text-[10px]"
                    >
                      {run.ok ? "ok" : "err"}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Registry */}
        <div className="p-3">
          <Collapsible open={registryOpen} onOpenChange={setRegistryOpen}>
            <CollapsibleTrigger className="flex w-full items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <Wrench className="h-3 w-3" />
              Registry
              {registryOpen ? (
                <ChevronDown className="ml-auto h-3 w-3" />
              ) : (
                <ChevronRight className="ml-auto h-3 w-3" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              {registry ? (
                <div className="mt-2 space-y-3">
                  <div>
                    <p className="mb-1 text-[10px] font-medium text-muted-foreground">
                      Models ({registry.models?.length || 0})
                    </p>
                    <div className="space-y-0.5">
                      {registry.models?.map((m) => (
                        <p key={m.name} className="font-mono text-[11px]">
                          {m.name}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-medium text-muted-foreground">
                      MCP Servers ({registry.mcp_servers?.length || 0})
                    </p>
                    {registry.mcp_servers?.map((s) => (
                      <details key={s.name} className="mb-1">
                        <summary className="cursor-pointer font-mono text-[11px]">
                          {s.name} ({s.tools?.length || 0} tools)
                        </summary>
                        <div className="ml-3 mt-0.5 flex flex-wrap gap-1">
                          {s.tools?.map((t) => (
                            <Badge
                              key={t}
                              variant="secondary"
                              className="text-[9px]"
                            >
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-medium text-muted-foreground">
                      Driver Tools ({registry.driver_tools?.length || 0})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {registry.driver_tools?.map((t) => (
                        <Badge
                          key={t}
                          variant="secondary"
                          className="text-[9px]"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">Loading...</p>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}
