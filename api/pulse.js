export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (!body) {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = JSON.parse(Buffer.concat(chunks).toString());
    } catch (e) {
      return res.status(400).json({ error: 'Invalid body' });
    }
  }

  const topic = body && body.topic;
  if (!topic) return res.status(400).json({ error: 'Missing topic' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const today = body.today || new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  // Single-turn call WITHOUT web_search tool — model uses its knowledge
  // to produce a structured JSON response. Fast and reliable.
  const systemPrompt = `You are an M&A intelligence analyst. Today is ${today}.
Based on your knowledge of recent M&A market trends, produce a structured intelligence brief.
Respond ONLY with a valid JSON object — no markdown, no backticks, no preamble.
JSON shape:
{
  "topic": "short 4-6 word clean title",
  "signal_count": integer between 8 and 20,
  "deal_count": integer between 2 and 10,
  "sentiment_label": "Bullish" or "Mixed" or "Cautious" or "Bearish",
  "findings": ["4 strings, each a crisp 1-sentence finding with a concrete data point, written like a sell-side analyst"],
  "key_driver": "1 sentence on the biggest driver right now",
  "watch": "1 sentence on the key risk to monitor"
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Provide an M&A intelligence brief on: ${topic}`
        }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: `Anthropic ${response.status}`, detail: errText });
    }

    const data = await response.json();
    const txt = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    const clean = txt.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
