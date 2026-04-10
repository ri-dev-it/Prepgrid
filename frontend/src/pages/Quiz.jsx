import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const POPULAR = ['React Hooks', 'JavaScript Closures', 'DBMS Normalization', 'OS Scheduling', 'Computer Networks', 'System Design Basics', 'Python Basics', 'SQL Joins', 'Data Structures', 'OOP Concepts'];

export function Quiz() {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const generate = async () => {
    if (!topic.trim()) return setErr('Enter a topic');
    setLoading(true); setErr('');
    try {
      const { data } = await api.post('/quiz/generate', { topic: topic.trim(), count });
      navigate('/quiz/session', { state: { ...data } });
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to generate quiz');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">AI Quiz Generator</h1>
        <p className="text-slate-400 text-sm mt-1">Generate MCQ tests on any topic using Groq LLaMA 3 (free)</p>
      </div>

      <div className="card p-6 space-y-5">
        <div>
          <label className="block text-sm text-slate-400 mb-2">Quiz Topic</label>
          <input
            className="input text-base"
            placeholder="e.g. React Hooks, Binary Trees, SQL Joins…"
            value={topic}
            onChange={e => { setTopic(e.target.value); setErr(''); }}
            onKeyDown={e => e.key === 'Enter' && generate()}
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">Number of Questions: <span className="text-white font-medium">{count}</span></label>
          <input type="range" min={5} max={20} step={5} value={count} onChange={e => setCount(+e.target.value)}
            className="w-full accent-indigo-500" />
          <div className="flex justify-between text-xs text-slate-600 mt-1"><span>5</span><span>10</span><span>15</span><span>20</span></div>
        </div>

        <div>
          <p className="text-sm text-slate-500 mb-2">Popular topics:</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR.map(t => (
              <button key={t} onClick={() => setTopic(t)}
                className={`tag text-xs cursor-pointer hover:border-indigo-600 hover:text-indigo-400 transition-colors ${topic === t ? 'border-indigo-600 text-indigo-400' : ''}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {err && <p className="text-red-400 text-sm">{err}</p>}

        <button onClick={generate} disabled={loading || !topic.trim()} className="btn-primary w-full py-3 text-base">
          {loading ? '⏳ Generating quiz…' : '🚀 Generate Quiz →'}
        </button>
      </div>

      <div className="flex justify-end">
        <Link to="/quiz/my-attempts" className="btn-ghost text-sm">My Past Quizzes →</Link>
      </div>
    </div>
  );
}

export function QuizSession() {
  const [state] = useState(() => window.location.state || window.history.state?.usr);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const startTime = useRef(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    if (!state?.questions) { navigate('/quiz'); return; }
    const secs = (state.count || 10) * 60;
    setTimeLeft(secs);
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(interval); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!state?.questions) return null;

  const qs = state.questions;
  const q = qs[current];

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true); setLoading(true);
    const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
    const answersArr = qs.map((_, i) => ({ selectedOption: answers[i] ?? -1 }));
    try {
      const { data } = await api.post('/quiz/submit', { topic: state.topic, token: state.token, answers: answersArr, timeTaken });
      setResults(data.results);
      setScore(data.score);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Evaluating your answers…</div>;

  if (submitted && results) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="card p-6 text-center space-y-2">
          <div className="text-5xl font-bold gradient-text">{score}/{qs.length}</div>
          <p className="text-slate-400">{state.topic} Quiz Results</p>
          <div className="flex justify-center gap-4 text-sm mt-2">
            <span className="text-emerald-400">{score} correct</span>
            <span className="text-red-400">{qs.length - score} wrong</span>
            <span className="text-slate-500">{Math.round((score / qs.length) * 100)}%</span>
          </div>
        </div>

        <div className="space-y-4">
          {qs.map((q, i) => {
            const r = results[i];
            return (
              <div key={i} className={`card p-4 border ${r?.isCorrect ? 'border-emerald-800/50' : 'border-red-800/50'}`}>
                <div className="flex items-start gap-2 mb-3">
                  <span className={`text-lg ${r?.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>{r?.isCorrect ? '✓' : '✗'}</span>
                  <p className="text-sm text-white font-medium">{q.question}</p>
                </div>
                <div className="space-y-1 ml-6">
                  {q.options.map((o, j) => (
                    <div key={j} className={`px-3 py-1.5 rounded-lg text-sm ${
                      j === r?.correctIndex ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-800' :
                      j === r?.selectedOption && !r?.isCorrect ? 'bg-red-900/30 text-red-300' :
                      'text-slate-400'
                    }`}>
                      {j === r?.correctIndex && '✓ '}{o.text}
                    </div>
                  ))}
                </div>
                {q.explanation && <p className="mt-2 ml-6 text-slate-500 text-xs">💡 {q.explanation}</p>}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate('/quiz')} className="btn-primary text-sm">New Quiz</button>
          <Link to={`/leaderboard/${encodeURIComponent(state.topic)}`} className="btn-secondary text-sm">View Leaderboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">{state.topic}</h2>
          <p className="text-slate-400 text-sm">Question {current + 1} of {qs.length}</p>
        </div>
        <div className={`font-mono text-lg font-bold ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
          ⏱ {fmt(timeLeft || 0)}
        </div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${((current + 1) / qs.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="card p-6 space-y-4">
        <p className="text-lg font-medium leading-relaxed">{q.question}</p>
        <div className="space-y-3">
          {q.options.map((o, i) => (
            <button key={i} onClick={() => setAnswers(a => ({ ...a, [current]: i }))}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                answers[current] === i
                  ? 'bg-indigo-600/30 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}>
              <span className="font-medium text-slate-500 mr-3">{String.fromCharCode(65 + i)}.</span>{o.text}
            </button>
          ))}
        </div>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} className="btn-secondary text-sm px-5">← Prev</button>
        <div className="flex gap-1">
          {qs.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-7 h-7 rounded-full text-xs font-medium transition-all ${
                i === current ? 'bg-indigo-600 text-white' :
                answers[i] != null ? 'bg-indigo-900/40 text-indigo-400' :
                'bg-slate-800 text-slate-500 hover:bg-slate-700'
              }`}>{i + 1}</button>
          ))}
        </div>
        {current < qs.length - 1 ? (
          <button onClick={() => setCurrent(c => c + 1)} className="btn-secondary text-sm px-5">Next →</button>
        ) : (
          <button onClick={handleSubmit} className="btn-primary text-sm px-5">Submit Quiz</button>
        )}
      </div>
    </div>
  );
}

export default Quiz;
