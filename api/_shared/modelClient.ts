interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

function getConfig() {
  return {
    baseUrl: process.env.AI_BASE_URL || 'https://api.deepseek.com/v1',
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'deepseek-chat',
    timeoutMs: Number(process.env.AI_TIMEOUT_MS) || 8000,
  };
}

export async function callModel(
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const { baseUrl, apiKey, model, timeoutMs } = getConfig();

  if (!apiKey) {
    throw new Error('AI API key not configured');
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 2500,
        temperature: 0.7,
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`AI API error: ${res.status}`);
    }

    const json = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return json.choices[0]?.message?.content || '';
  } finally {
    clearTimeout(timeout);
  }
}
