import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const ROLES = ['Frontend', 'Backend', 'Full Stack', 'DSA'];

export function Interview() {
  const { user } = useAuthStore();
  const [role, setRole] = useState('DSA');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const free = user?.tier === 'free';
  const used = user?.monthlyInterviews || 0;
  const left = Math.max(0, 5 - used);

  const start = async () => {
    setLoading(true); setErr('');
    try {
      const { data } = await api.post('/interview/start', { role });
      navigate('/interview/session', { state: { sessionId: data.sessionId, question: data.question, role, questionsAsked: data.questionsAsked, maxQuestions: data.maxQuestions } });
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to start');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">AI Mock Interview</h1>
        <p className="text-slate-400 mt-1 text-sm">Adaptive technical interviews powered by Groq LLaMA 3 (free)</p>
      </div>

      {free && (
        <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700">
          <div>
            <p className="text-white font-medium">Free Tier — {left}/5 interviews left this month</p>
            <div className="mt-2 w-48 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(used / 5) * 100}%` }} />
            </div>
          </div>
          {left === 0 ? (
            <Link to="/billing" className="btn-primary text-sm">Upgrade</Link>
          ) : (
            <span className="text-slate-400 text-sm">{left} remaining</span>
          )}
        </div>
      )}

      {err && <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">{err}</div>}

      <div className="card p-6 space-y-6">
        <div>
          <h2 className="font-semibold mb-3">Select Interview Role</h2>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`p-4 rounded-xl border text-left transition-all ${role === r ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'}`}>
                <div className="font-medium">{r}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {{ Frontend: 'HTML, CSS, JS, React, Browser APIs', Backend: 'Node, DB, APIs, System Design', 'Full Stack': 'Both Frontend + Backend', DSA: 'Arrays, Trees, DP, Graphs' }[r]}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-800 rounded-xl text-sm text-slate-400 space-y-2">
          <p className="text-white font-medium">How it works</p>
          <p>• 10 adaptive questions — difficulty adjusts based on your answers</p>
          <p>• Each answer gets a score (0–10) with specific feedback</p>
          <p>• Session ends with a full performance summary and tips</p>
          <p>• Review all past sessions in Interview History</p>
        </div>

        <button onClick={start} disabled={loading || (free && left === 0)} className="btn-primary w-full py-3 text-base">
          {loading ? '⏳ Starting…' : `Start ${role} Interview →`}
        </button>
      </div>

      <div className="flex justify-end">
        <Link to="/interview/history" className="btn-ghost text-sm">View Past Sessions →</Link>
      </div>
    </div>
  );
}

export function InterviewSession() {
  const navigate = useNavigate();
  const [state, setState] = useState(() => {
    const loc = window.history.state?.usr;
    return loc || null;
  });

  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [summary, setSummary] = useState(null);
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  // Read from router state
  useEffect(() => {
    const s = window.location.state || window.history.state?.usr;
    if (!s?.sessionId) { navigate('/interview'); return; }
    setState(s);
    setMessages([{ role: 'ai', content: s.question }]);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const submitAnswer = async () => {
    if (!answer.trim() || !state?.sessionId) return;
    const userMsg = answer.trim();
    setMessages(m => [...m, { role: 'user', content: userMsg }]);
    setAnswer('');
    setLoading(true); setEvaluation(null);

    try {
      const { data } = await api.post('/interview/answer', { sessionId: state.sessionId, answer: userMsg });
      setEvaluation(data.evaluation);
      if (data.completed) {
        setCompleted(true);
        setSummary(data.summary);
        setMessages(m => [...m, { role: 'system', content: '🎉 Interview completed!' }]);
      } else {
        setMessages(m => [...m, { role: 'ai', content: data.nextQuestion }]);
        setState(s => ({ ...s, questionsAsked: data.questionsAsked }));
      }
    } catch (e) {
      setMessages(m => [...m, { role: 'system', content: `Error: ${e.response?.data?.message || 'Something went wrong'}` }]);
    }
    setLoading(false);
  };

  if (!state) return null;

  const progress = ((state.questionsAsked || 1) / (state.maxQuestions || 10)) * 100;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] lg:h-screen max-w-3xl mx-auto p-4 gap-4">
      {/* Header */}
      <div className="card p-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="font-semibold">{state.role} Interview</h2>
          <p className="text-slate-400 text-sm">Question {state.questionsAsked}/{state.maxQuestions}</p>
        </div>
        <div className="w-32">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-1 text-right">{Math.round(progress)}%</p>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === 'ai' ? 'bg-slate-800 text-slate-200 rounded-tl-sm' :
              m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' :
              'bg-emerald-900/30 border border-emerald-700 text-emerald-300 w-full text-center rounded-lg'
            }`}>
              {m.role === 'ai' && <span className="text-indigo-400 text-xs font-medium block mb-1">AI Interviewer</span>}
              {m.content}
            </div>
          </div>
        ))}

        {/* Evaluation card */}
        {evaluation && !completed && (
          <div className="card p-4 border-indigo-800/50 bg-indigo-900/10 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-indigo-400">{evaluation.score}/10</span>
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${evaluation.score * 10}%` }} />
              </div>
            </div>
            <p className="text-slate-300 text-sm">{evaluation.feedback}</p>
            {evaluation.improvement && <p className="text-amber-400 text-xs">💡 {evaluation.improvement}</p>}
          </div>
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0,1,2].map(i => <span key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Summary */}
      {completed && summary && (
        <div className="card p-5 flex-shrink-0 space-y-3 border-emerald-800/50">
          <h3 className="font-semibold text-emerald-400">Interview Complete! 🎉</h3>
          <p className="text-slate-300 text-sm">{summary.summary}</p>
          {summary.strengths?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Strengths</p>
              {summary.strengths.map((s, i) => <p key={i} className="text-emerald-400 text-sm">✓ {s}</p>)}
            </div>
          )}
          {summary.improvements?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Improve</p>
              {summary.improvements.map((s, i) => <p key={i} className="text-amber-400 text-sm">→ {s}</p>)}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Link to="/interview" className="btn-primary text-sm">New Interview</Link>
            <Link to="/interview/history" className="btn-secondary text-sm">View History</Link>
          </div>
        </div>
      )}

      {/* Input */}
      {!completed && (
        <div className="flex-shrink-0 flex gap-3">
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) submitAnswer(); }}
            placeholder="Type your answer… (Ctrl+Enter to submit)"
            rows={3}
            disabled={loading}
            className="input flex-1 resize-none py-3 text-sm"
          />
          <button onClick={submitAnswer} disabled={loading || !answer.trim()} className="btn-primary px-5 self-end">
            Send
          </button>
        </div>
      )}
    </div>
  );
}

export function InterviewHistory() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/interview/sessions').then(r => { setSessions(r.data.sessions); setLoading(false); });
  }, []);

  const loadSession = async (id) => {
    const { data } = await api.get(`/interview/sessions/${id}`);
    setSelected(data.session);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Interview History</h1>
        <Link to="/interview" className="btn-primary text-sm">New Interview</Link>
      </div>

      {loading ? <p className="text-slate-500">Loading…</p> : sessions.length === 0 ? (
        <div className="text-center py-16 card">
          <p className="text-slate-500">No interviews yet</p>
          <Link to="/interview" className="btn-primary text-sm mt-4 inline-block">Start Your First Interview</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            {sessions.map(s => (
              <button key={s._id} onClick={() => loadSession(s._id)}
                className={`w-full card p-4 text-left hover:border-indigo-700 transition-colors ${selected?._id === s._id ? 'border-indigo-600' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{s.role} Interview</span>
                  <span className={`text-sm font-bold ${s.averageScore >= 7 ? 'text-emerald-400' : s.averageScore >= 5 ? 'text-amber-400' : 'text-red-400'}`}>
                    {s.averageScore?.toFixed(1) ?? '—'}/10
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                  <span className={s.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}>{s.status}</span>
                </div>
              </button>
            ))}
          </div>

          {selected && (
            <div className="card p-5 space-y-4 h-fit">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{selected.role} — {new Date(selected.createdAt).toLocaleDateString()}</h2>
                <span className="text-2xl font-bold text-indigo-400">{selected.averageScore?.toFixed(1)}/10</span>
              </div>
              {selected.summary && <p className="text-slate-300 text-sm">{selected.summary}</p>}
              {selected.strengths?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 uppercase mb-1">Strengths</p>
                  {selected.strengths.map((s, i) => <p key={i} className="text-emerald-400 text-sm">✓ {s}</p>)}
                </div>
              )}
              {selected.improvements?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 uppercase mb-1">Improvements</p>
                  {selected.improvements.map((s, i) => <p key={i} className="text-amber-400 text-sm">→ {s}</p>)}
                </div>
              )}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <p className="text-xs text-slate-500 uppercase font-semibold">Transcript</p>
                {selected.messages?.filter(m => m.role !== 'system').map((m, i) => (
                  <div key={i} className={`p-2 rounded-lg text-xs ${m.role === 'ai' ? 'bg-slate-800 text-slate-300' : 'bg-indigo-900/20 text-indigo-200'}`}>
                    <span className="font-medium">{m.role === 'ai' ? 'AI: ' : 'You: '}</span>{m.content}
                    {m.score != null && <span className="ml-2 text-indigo-400 font-medium">[{m.score}/10]</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Interview;
