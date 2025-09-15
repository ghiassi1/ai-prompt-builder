{
  "name": "ai-prompt-builder-backend",
  "version": "1.0.0",
  "description": "Backend API for AI Prompt Builder",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "express-rate-limit": "^6.7.0",
    "dotenv": "^16.0.3",
    "openai": "^4.20.1",
    "@anthropic-ai/sdk": "^0.9.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "engines": {
    "node": "18.x"
  }
}
