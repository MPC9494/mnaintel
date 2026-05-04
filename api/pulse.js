module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body manually if needed
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
  const today = body && body.today;

  if (!topic) {
    return res.status(400).json({ error: 'Missing topic' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const date = today || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const systemPrompt = 'You are an M&A intelligence analyst. Today is ' + date + '. Use web search to find 30-day signals on the given topic. Respond ONLY with a valid JSON object — no markdown, no preamble, no backticks. Shape: {"topic":"short 4-6 word clean title","signal_count":integer,"deal_count":integer,"sentiment_label":"Bullish|Mixed|Cautious|Bearish","findings":["4 strings, each a crisp 1-sentence finding with a concrete data point, written like a sell-side analyst"],"key_driver":"1 sentence on the biggest driver right now","watch":"1 sentence on the key risk to monitor"}';

  try {
    const anthropicResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: systemPrompt,
        messages: [{ role: 'user', content: 'Run a 30-day M&A intelligence pulse on: ' + topic }]
      })
    });

    if (!anthropicResp.ok) {
      const errText = await anthropicResp.text();
      return res.status(502).json({ error: 'Anthropic error ' + anthropicResp.status, detail: errText });
    }

    const data = await anthropicResp.json();
    const txt = (data.content || [])
      .filter(function(b) { return b.type === 'text'; })
      .map(function(b) { return b.text; })
      .join('');

    const clean = txt.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
};
