// backend/server.js
const express = require('express');
const cors = require('cors');

const app = express();

// Parse JSON bodies BEFORE routes
app.use(express.json());

// --- CORS: allow prod, previews, and local dev  (REPLACE your existing CORS block with this)
const allowedOrigins = [
  process.env.FRONTEND_URL,           // e.g. https://ai-prompt-builder-pi.vercel.app
  /\.vercel\.app$/i,                  // any Vercel preview domain
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin(origin, cb) {
    // allow requests without an Origin (curl/Postman/health checks)
    if (!origin) return cb(null, true);
    const ok = allowedOrigins.some(o => (o?.test ? o.test(origin) : o === origin));
    cb(ok ? null : new Error('Not allowed by CORS'), ok);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// Handle CORS preflight globally
app.options('*', cors());
// --- end CORS

// Health endpoint
app.get('/api/health', (req, res) => res.json({ ok: true }));

// AI generator route
app.post('/api/generate-prompt', async (req, res) => {
  try {
    const { description = '', userContext = '', additionalContext = '' } = req.body || {};

    if (process.env.OPENAI_API_KEY) {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You create excellent, safe, well-structured prompts.' },
            {
              role: 'user',
              content:
                `Description: ${description}\n` +
                `User context: ${userContext}\n` +
                `Additional context: ${additionalContext}\n\n` +
                `Write one optimized prompt only.`,
            },
          ],
          temperature: 0.2,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error?.message || 'OpenAI error');

      const prompt = data?.choices?.[0]?.message?.content?.trim() || 'Generated prompt.';
      return res.json({ prompt });
    }

    // Fallback without OPENAI_API_KEY
    const prompt =
      `Create a comprehensive answer for "${description}". ` +
      `Consider the user context: ${userContext}. ` +
      `Additional context: ${additionalContext}. ` +
      `Structure the output with clear sections, numbered steps, and concrete examples.`;
    res.json({ prompt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('API listening on port', port));
