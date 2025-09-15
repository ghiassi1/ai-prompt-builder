// backend/server.js
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api/', limiter);

// AI generation endpoint
app.post('/api/generate-prompt', async (req, res) => {
  try {
    const { description, userContext, additionalContext } = req.body;

    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        error: 'Description is required'
      });
    }

    // Choose your AI provider (OpenAI or Anthropic)
    const aiProvider = process.env.AI_PROVIDER || 'openai'; // 'openai' or 'anthropic'
    
    let generatedPrompt;
    
    if (aiProvider === 'openai') {
      generatedPrompt = await generateWithOpenAI(description, userContext, additionalContext);
    } else if (aiProvider === 'anthropic') {
      generatedPrompt = await generateWithAnthropic(description, userContext, additionalContext);
    } else {
      throw new Error('Invalid AI provider specified');
    }

    res.json({
      prompt: generatedPrompt,
      provider: aiProvider
    });

  } catch (error) {
    console.error('Error generating prompt:', error);
    res.status(500).json({
      error: 'Failed to generate prompt. Please try again.'
    });
  }
});

// OpenAI implementation
async function generateWithOpenAI(description, userContext, additionalContext) {
  const { OpenAI } = require('openai');
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const systemPrompt = `You are an expert prompt engineer. Your task is to create effective, well-structured prompts based on user descriptions.

Create prompts that:
- Are specific and clear to avoid ambiguity
- Include contextual framing when appropriate
- Use proper structure and formatting
- Include relevant constraints and guidelines
- Follow prompt engineering best practices

Only return the generated prompt, no explanations or meta-commentary.`;

  let userPrompt = `Create an effective prompt based on this description: "${description}"`;
  
  if (userContext) {
    userPrompt += `\n\nUser context: ${userContext}`;
  }
  
  if (additionalContext) {
    userPrompt += `\n\nAdditional context: ${additionalContext}`;
  }

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 1000,
    temperature: 0.7
  });

  return completion.choices[0].message.content.trim();
}

// Anthropic implementation
async function generateWithAnthropic(description, userContext, additionalContext) {
  const Anthropic = require('@anthropic-ai/sdk');
  
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  let prompt = `You are an expert prompt engineer. Create an effective, well-structured prompt based on this description: "${description}"

Create prompts that:
- Are specific and clear to avoid ambiguity
- Include contextual framing when appropriate
- Use proper structure and formatting
- Include relevant constraints and guidelines
- Follow prompt engineering best practices`;

  if (userContext) {
    prompt += `\n\nUser context: ${userContext}`;
  }
  
  if (additionalContext) {
    prompt += `\n\nAdditional context: ${additionalContext}`;
  }

  prompt += `\n\nOnly return the generated prompt, no explanations or meta-commentary.`;

  const completion = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
    max_tokens: 1000,
    messages: [
      { role: 'user', content: prompt }
    ]
  });

  return completion.content[0].text.trim();
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    aiProvider: process.env.AI_PROVIDER || 'openai'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`AI Provider: ${process.env.AI_PROVIDER || 'openai'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

module.exports = app;
