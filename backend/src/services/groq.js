const axios = require('axios');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.GROQ_MODEL || 'llama3-8b-8192';

async function chat(messages, systemPrompt, maxTokens = 1024) {
  try {
    const res = await axios.post(
      GROQ_URL,
      {
        model: MODEL,
        max_tokens: maxTokens,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );
    return res.data.choices[0].message.content;
  } catch (err) {
    console.error('Groq error:', err.response?.data || err.message);
    throw new Error('AI service temporarily unavailable');
  }
}

function parseJSON(text) {
  try {
    const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(clean);
  } catch {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { return null; }
    }
    return null;
  }
}

// ─── Interview ───────────────────────────────────────────────────────────────

exports.generateInterviewQuestion = async (role, difficulty, history = []) => {
  const sys = `You are a senior technical interviewer for ${role} positions. Ask ONE concise technical question at ${difficulty} difficulty. Return ONLY the question, no extra text.`;
  const context = history.length
    ? `Previous questions asked: ${history.slice(-3).join(' | ')}. Ask a different question.`
    : 'Start the interview with a foundational question.';
  return chat([{ role: 'user', content: context }], sys, 200);
};

exports.evaluateAnswer = async (question, answer, role) => {
  const sys = `You are evaluating a ${role} interview answer. Respond in valid JSON only:
{"score": <0-10>, "feedback": "<2 sentences>", "improvement": "<1 actionable tip>"}`;
  const raw = await chat(
    [{ role: 'user', content: `Question: ${question}\nAnswer: ${answer}` }],
    sys, 400
  );
  return parseJSON(raw) || { score: 5, feedback: raw.substring(0, 200), improvement: 'Keep practicing!' };
};

exports.generateInterviewSummary = async (qaHistory, role) => {
  const sys = `You are a ${role} interview coach. Analyze this interview and return valid JSON only:
{"summary": "<2-3 sentences overall>", "strengths": ["<str1>","<str2>","<str3>"], "improvements": ["<imp1>","<imp2>","<imp3>"]}`;
  const raw = await chat([{ role: 'user', content: JSON.stringify(qaHistory) }], sys, 600);
  return parseJSON(raw) || { summary: 'Interview completed.', strengths: [], improvements: [] };
};

// ─── Quiz ────────────────────────────────────────────────────────────────────

exports.generateQuiz = async (topic, count = 10) => {
  const sys = `You are a quiz generator. Return a valid JSON array of exactly ${count} MCQ objects. Each object:
{"question":"<q>","options":[{"text":"<a>","isCorrect":false},{"text":"<b>","isCorrect":true},{"text":"<c>","isCorrect":false},{"text":"<d>","isCorrect":false}],"explanation":"<why correct answer is right>"}
Exactly ONE option must have isCorrect:true. Return ONLY the JSON array, no other text.`;
  const raw = await chat(
    [{ role: 'user', content: `Generate ${count} MCQs about: ${topic}` }],
    sys, 3000
  );
  const parsed = parseJSON(raw);
  return Array.isArray(parsed) ? parsed : [];
};

exports.evaluateShortAnswer = async (question, answer, topic) => {
  const sys = `You are a ${topic} subject expert. Grade the answer. Return valid JSON only:
{"score": <0-10>, "feedback": "<2 sentences>", "correct_answer": "<brief correct answer>"}`;
  const raw = await chat(
    [{ role: 'user', content: `Q: ${question}\nA: ${answer || '(no answer)'}` }],
    sys, 300
  );
  return parseJSON(raw) || { score: 0, feedback: 'Unable to evaluate', correct_answer: '' };
};

// ─── Code Evaluation Hint ────────────────────────────────────────────────────

exports.getCodeHint = async (code, language, questionTitle) => {
  const sys = `You are a coding mentor. Give a helpful hint (NOT the solution) for the student's code. Be encouraging and specific. Max 3 sentences.`;
  return chat(
    [{ role: 'user', content: `Problem: ${questionTitle}\nLanguage: ${language}\nCode:\n${code}` }],
    sys, 200
  );
};
