// backend/server.js
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());

// Allow only your Vercel frontend
const FRONTEND_URL =
  process.env.FRONTEND_URL || 'https://ai-prompt-builder-pi.vercel.app';

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  })
);

// CORS preflight
app.options('*', cors());

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Generate prompt via OpenAI (falls back if no key)
app.post('/api/generate-prompt', async (req, res) => {
  try {
    const { description = '', userContext = '', additionalContext = '' } = req.body || {};
    const openaiKey = process.env.OPENAI_API_KEY;

    // Build a deterministic fallback prompt so the UI still works if no key is set
    const fallback = `Please write a high-quality prompt based on:
- Goal: ${description || '(not provided)'}
- User context: ${userContext || '(none)'}
- Extra context: ${additionalContext || '(none)'}
Return a single, ready-to-use prompt.`;

    if (!openaiKey) {
      console.warn('[generate-prompt] Missing OPENAI_API_KEY – returning fallback.');
      return res.json({ prompt: fallback });
    }

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // or 'gpt-3.5-turbo' if you prefer
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content:
              'You rewrite user intent into a single, clear, high-quality prompt. Output only the final prompt.',
          },
          {
            role: 'user',
            content:
              `User goal: ${description}\n` +
              `User context: ${userContext}\n` +
              `Additional context: ${additionalContext}\n` +
              `Return just the final prompt.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenAI error ${response.status}: ${text}`);
    }

    const data = await response.json();
    const prompt = data?.choices?.[0]?.message?.content?.trim();

    if (!prompt) throw new Error('No content returned from OpenAI');

    return res.json({ prompt });
  } catch (err) {
    console.error('[generate-prompt] ERROR:', err?.message || err);
    return res
      .status(500)
      .json({ error: 'GENERATION_FAILED', message: err?.message || 'Unknown error' });
  }
});

// Start se
