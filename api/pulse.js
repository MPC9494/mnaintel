module.exports = async function handler(req, res) {
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

  const messages = [{ role: 'user', content: 'Run a 30-day M&A intelligence pulse on: ' + topic }];

  try {
    // Agentic loop: keep calling until stop_reason is 'end_turn' (no more tool calls)
    let finalText = '';
    let iterations = 0;

    while (iterations < 5) {
      iterations++;

      const anthropicResp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'interleaved-thinking-2025-05-14'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          system: systemPrompt,
          messages: messages
        })
      });

      if (!anthropicResp.ok) {
        const errText = await anthropicResp.text();
        return res.status(502).json({ error: 'Anthropic error ' + anthropicResp.status, detail: errText });
      }

      const data = await anthropicResp.json();
      const stopReason = data.stop_reason;
      const content = data.content || [];

      // Add assistant turn to message history
      messages.push({ role: 'assistant', content: content });

      if (stopReason === 'end_turn') {
        // Extract final text block
        finalText = content
          .filter(function(b) { return b.type === 'text'; })
          .map(function(b) { return b.text; })
          .join('');
        break;
      }

      if (stopReason === 'tool_use') {
        // Build tool results for next turn
        const toolResults = content
          .filter(function(b) { return b.type === 'tool_use'; })
          .map(function(b) {
            return {
              type: 'tool_result',
              tool_use_id: b.id,
              content: b.type === 'tool_use' && b.input ? JSON.stringify(b.input) : ''
            };
          });

        // Find actual tool results from content (web_search returns them inline)
        const toolResultBlocks = content
          .filter(function(b) { return b.type === 'tool_result'; });

        if (toolResultBlocks.length > 0) {
          messages.push({ role: 'user', content: toolResultBlocks });
        } else if (toolResults.length > 0) {
          messages.push({ role: 'user', content: toolResults });
        } else {
          break;
        }
        continue;
      }

      // Any other stop reason — grab text if available
      finalText = content
        .filter(function(b) { return b.type === 'text'; })
        .map(function(b) { return b.text; })
        .join('');
      break;
    }

    if (!finalText) {
      return res.status(500).json({ error: 'No text response from model after ' + iterations + ' iterations' });
    }

    const clean = finalText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
};
