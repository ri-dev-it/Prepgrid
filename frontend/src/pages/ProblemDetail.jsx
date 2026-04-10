import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../services/api';

const LANGS = ['javascript', 'python', 'cpp', 'java', 'c'];

const diffBadge = (d) => {
  if (d === 'Easy') return <span className="badge-easy">{d}</span>;
  if (d === 'Medium') return <span className="badge-medium">{d}</span>;
  return <span className="badge-hard">{d}</span>;
};

export default function ProblemDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [lang, setLang] = useState('javascript');
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hint, setHint] = useState('');
  const [hintLoading, setHintLoading] = useState(false);
  const [tab, setTab] = useState('description');
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    api.get(`/practice/questions/${id}`).then(({ data }) => {
      setQuestion(data.question);
      setCode(data.question.starterCode?.[lang] || '');
      setBookmarked(data.question.bookmarked);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (question) setCode(question.starterCode?.[lang] || `// ${lang} starter code`);
  }, [lang]);

  const runCode = async () => {
    setRunning(true); setOutput(''); setResult(null);
    try {
      const { data } = await api.post('/practice/run', { code, language: lang, input });
      setOutput(data.stderr ? `Error:\n${data.stderr}` : data.output || '(no output)');
    } catch (e) { setOutput(e.response?.data?.message || 'Run failed'); }
    setRunning(false);
  };

  const submitCode = async () => {
    setSubmitting(true); setResult(null);
    try {
      const { data } = await api.post('/practice/submit', { questionId: id, code, language: lang });
      setResult(data.result);
      setTab('result');
      if (data.submission.status === 'Accepted') {
        setQuestion(q => q ? { ...q, solved: true } : q);
      }
    } catch (e) {
      const msg = e.response?.data?.message || 'Submission failed';
      if (e.response?.data?.upgradeRequired) setResult({ error: msg, upgrade: true });
      else setResult({ error: msg });
    }
    setSubmitting(false);
  };

  const getHint = async () => {
    setHintLoading(true); setHint('');
    try {
      const { data } = await api.post('/practice/hint', { questionId: id, code, language: lang });
      setHint(data.hint);
    } catch (e) { setHint('Could not load hint'); }
    setHintLoading(false);
  };

  const toggleBookmark = async () => {
    try {
      const { data } = await api.post(`/practice/bookmark/${id}`);
      setBookmarked(data.bookmarked);
    } catch {}
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-500">Loading…</div>;
  if (!question) return <div className="p-6 text-slate-500">Problem not found. <Link to="/practice" className="text-indigo-400">Back</Link></div>;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] lg:h-screen flex-col lg:flex-row">
      {/* Left: Problem description */}
      <div className="w-full lg:w-[45%] flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-800 flex-shrink-0">
          <Link to="/practice" className="text-slate-400 hover:text-white text-sm">← Problems</Link>
          <span className="text-slate-700">|</span>
          <div className="flex gap-2">
            {['description', 'submissions', 'hints'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`text-sm px-3 py-1 rounded-md transition-colors capitalize ${tab === t ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:text-white'}`}>
                {t}
              </button>
            ))}
            {result && (
              <button onClick={() => setTab('result')}
                className={`text-sm px-3 py-1 rounded-md transition-colors ${tab === 'result' ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:text-white'}`}>
                Result
              </button>
            )}
          </div>
          <button onClick={toggleBookmark} className="ml-auto text-lg" title="Bookmark">
            {bookmarked ? '🔖' : '📄'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'description' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold">{question.title}</h1>
                {diffBadge(question.difficulty)}
                <span className="tag">{question.topic}</span>
                {question.solved && <span className="text-emerald-400 text-sm font-medium">✓ Solved</span>}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{question.description}</p>
              {question.constraints && (
                <div className="p-3 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Constraints</p>
                  <p className="text-slate-300 text-sm font-mono whitespace-pre-wrap">{question.constraints}</p>
                </div>
              )}
              {question.examples?.length > 0 && (
                <div className="space-y-3">
                  <p className="text-slate-400 text-xs font-semibold uppercase">Examples</p>
                  {question.examples.map((ex, i) => (
                    <div key={i} className="p-3 bg-slate-800 rounded-lg text-sm font-mono space-y-1">
                      <p><span className="text-slate-500">Input: </span><span className="text-slate-300">{ex.input}</span></p>
                      <p><span className="text-slate-500">Output: </span><span className="text-emerald-400">{ex.output}</span></p>
                      {ex.explanation && <p className="text-slate-500 text-xs">{ex.explanation}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'hints' && (
            <div className="space-y-4">
              <p className="text-slate-400 text-sm">Get an AI hint for your current code without spoiling the solution.</p>
              <button onClick={getHint} disabled={hintLoading} className="btn-secondary text-sm">
                {hintLoading ? '⏳ Thinking…' : '💡 Get AI Hint'}
              </button>
              {hint && <div className="p-4 bg-amber-900/20 border border-amber-700/40 rounded-xl text-amber-200 text-sm leading-relaxed">{hint}</div>}
              {question.hints?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-slate-500 text-xs uppercase font-semibold">Built-in hints</p>
                  {question.hints.map((h, i) => (
                    <details key={i} className="p-3 bg-slate-800 rounded-lg cursor-pointer">
                      <summary className="text-slate-400 text-sm">Hint {i + 1}</summary>
                      <p className="text-slate-300 text-sm mt-2">{h}</p>
                    </details>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'result' && result && (
            <div className="space-y-4">
              {result.error ? (
                <div className="p-4 bg-red-900/20 border border-red-700 rounded-xl">
                  <p className="text-red-400 font-medium">{result.error}</p>
                  {result.upgrade && <Link to="/billing" className="btn-primary text-sm mt-3 inline-block">Upgrade to Pro</Link>}
                </div>
              ) : (
                <>
                  <div className={`p-4 rounded-xl border ${result.passed === result.total ? 'bg-emerald-900/20 border-emerald-700' : 'bg-red-900/20 border-red-700'}`}>
                    <p className={`text-lg font-bold ${result.passed === result.total ? 'text-emerald-400' : 'text-red-400'}`}>
                      {result.passed === result.total ? '✅ Accepted!' : '❌ Wrong Answer'}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">{result.passed}/{result.total} test cases passed</p>
                  </div>
                  <div className="space-y-2">
                    {result.results?.map((r, i) => (
                      <div key={i} className={`p-3 rounded-lg text-sm font-mono border ${r.status === 'Passed' ? 'bg-emerald-900/10 border-emerald-800' : 'bg-red-900/10 border-red-800'}`}>
                        <p className={`font-medium ${r.status === 'Passed' ? 'text-emerald-400' : 'text-red-400'}`}>Test {i + 1}: {r.status}</p>
                        {r.input && <p className="text-slate-500 text-xs mt-1">Input: {r.input}</p>}
                        <p className="text-slate-400 text-xs">Expected: {r.expected}</p>
                        {r.status !== 'Passed' && <p className="text-red-300 text-xs">Got: {r.actual || r.stderr}</p>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Code editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Editor toolbar */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-800 bg-slate-900 flex-shrink-0">
          <select
            value={lang}
            onChange={e => setLang(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={runCode} disabled={running} className="btn-secondary text-sm px-4 py-1.5">
              {running ? '⏳ Running…' : '▶ Run'}
            </button>
            <button onClick={submitCode} disabled={submitting} className="btn-primary text-sm px-4 py-1.5">
              {submitting ? '⏳ Submitting…' : '⬆ Submit'}
            </button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 min-h-0">
          <Editor
            height="100%"
            language={lang === 'cpp' ? 'cpp' : lang}
            value={code}
            onChange={v => setCode(v || '')}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
            }}
          />
        </div>

        {/* Custom input + output */}
        <div className="h-44 border-t border-slate-800 flex flex-col flex-shrink-0">
          <div className="flex border-b border-slate-800">
            {['Input', 'Output'].map((t, i) => (
              <button key={t}
                onClick={() => document.getElementById(`io-${i}`).scrollIntoView()}
                className="px-4 py-2 text-xs font-medium text-slate-400 border-r border-slate-800 hover:text-white">{t}</button>
            ))}
          </div>
          <div className="flex flex-1 min-h-0">
            <textarea
              id="io-0"
              className="flex-1 bg-transparent text-slate-300 text-xs font-mono p-3 resize-none focus:outline-none border-r border-slate-800"
              placeholder="Custom input (stdin)…"
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <pre id="io-1" className="flex-1 p-3 text-xs font-mono text-slate-300 overflow-auto whitespace-pre-wrap">
              {output || <span className="text-slate-600">Output will appear here after running code</span>}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
