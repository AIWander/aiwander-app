export type Event =
  | { kind: "run_start"; ts: string; model: string; base_url: string; mcp_servers: string[]; task: string; tool_call_parser: string; user_prompt: string }
  | { kind: "tools_registered"; ts: string; count: number; names: string[] }
  | { kind: "llm_request"; ts: string; iteration: number; message_count: number; model: string }
  | { kind: "llm_response"; ts: string; iteration: number; content: string | null; reasoning?: string; tool_calls?: ToolCall[]; usage: Usage }
  | { kind: "tool_call"; ts: string; iteration: number; id: string; name: string; arguments: string }
  | { kind: "tool_result"; ts: string; iteration: number; id: string; ok: boolean; content: string }
  | { kind: "final_answer"; ts: string; iteration: number; content: string }
  | { kind: "run_end"; ts: string; ok: boolean; duration_ms: number; iterations: number; total_tokens: number; error?: string }
  | { kind: "error"; ts: string; error: string };

export interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface HealthResponse {
  status: string;
  uptime_secs: number;
  registered_models: number;
  registered_servers: number;
}

export interface RegistryModel {
  name: string;
  base_url: string;
  model_id: string;
}

export interface RegistryMcpServer {
  name: string;
  tools: string[];
}

export interface RegistryResponse {
  models: RegistryModel[];
  mcp_servers: RegistryMcpServer[];
  driver_tools: string[];
}

export interface RunSummary {
  id: string;
  model: string;
  task: string;
  started_at: string;
  duration_ms?: number;
  ok?: boolean;
  iterations?: number;
  total_tokens?: number;
}
