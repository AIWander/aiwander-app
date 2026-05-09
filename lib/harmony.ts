/**
 * Parse gpt-oss harmony format.
 * Input like: <|channel|>analysis<|message|>thinking...<|end|><|channel|>final<|message|>answer<|end|>
 * Returns { reasoning?: string; answer: string }
 */
export function parseHarmony(content: string): { reasoning?: string; answer: string } {
  const channelPattern = /<\|channel\|>(\w+)<\|message\|>([\s\S]*?)<\|end\|>/g;
  let reasoning: string | undefined;
  let answer = content;
  let hasChannels = false;

  let match;
  while ((match = channelPattern.exec(content)) !== null) {
    hasChannels = true;
    const [, channel, message] = match;
    if (channel === "analysis" || channel === "thinking" || channel === "reasoning") {
      reasoning = message.trim();
    } else if (channel === "final" || channel === "response") {
      answer = message.trim();
    }
  }

  if (!hasChannels) {
    return { answer: content };
  }

  return { reasoning, answer };
}
