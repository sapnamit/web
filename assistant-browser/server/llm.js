const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

async function chatWithOllama(messages) {
  const url = `${OLLAMA_URL}/api/chat`;
  const resp = await axios.post(url, {
    model: OLLAMA_MODEL,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    stream: false,
  }, { timeout: 30000 });
  const data = resp.data;
  // Ollama chat API returns an object with message/content on final response
  const content = data?.message?.content || data?.content || '';
  return content;
}

async function chatWithOpenAI(messages) {
  const url = `${OPENAI_BASE_URL}/chat/completions`;
  const resp = await axios.post(url, {
    model: OPENAI_MODEL,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    temperature: 0.2,
  }, {
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    timeout: 30000,
  });
  const content = resp.data.choices?.[0]?.message?.content || '';
  return content;
}

async function runChat({ system, messages }) {
  const fullMessages = [];
  if (system) fullMessages.push({ role: 'system', content: system });
  fullMessages.push(...messages);

  // Try OLLAMA first if reachable
  try {
    return await chatWithOllama(fullMessages);
  } catch (_) {
    // fall back to OpenAI if key is present
    if (!OPENAI_API_KEY) throw new Error('No local OLLAMA or OPENAI_API_KEY available');
    return await chatWithOpenAI(fullMessages);
  }
}

module.exports = { runChat };
