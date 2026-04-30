export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { topic, today } = body;
  if (!topic) {
    return new Response(JSON.stringify({ error: 'Missing topic' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const systemPrompt = `You are an M&A intelligence analyst. Today is ${today || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}. Use web search to find 30-day signals on the given topic. Respond ONLY with a valid JSON object — no markdown, no preamble, no backticks. Shape: {"topic":"short 4-6 word clean title","signal_count":integer,"deal_count":integer,"sentiment_label":"Bullish|Mixed|Cautious|Bearish","findings":["4 strings, each a crisp 1-sentence finding with a concrete data point, written like a sell-side analyst"],"key_driver":"1 sentence on the biggest driver right now","watch":"1 sentence on the key risk to monitor"}`;

  const anthropicResp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      system: systemPrompt,
      messages: [{ role: 'user', content: 'Run a 30-day M&A intelligence pulse on: ' + topic }]
    })
  });

  if (!anthropicResp.ok) {
    const errText = await anthropicResp.text();
    return new Response(JSON.stringify({ error: 'Anthropic error: ' + anthropicResp.status, detail: errText }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const anthropicData = await anthropicResp.json();
  const txt = (anthropicData.content || [])
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');

  const clean = txt.replace(/```json|```/g, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to parse AI response', raw: clean }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify(parsed), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}
