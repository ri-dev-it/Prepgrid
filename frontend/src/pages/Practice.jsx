import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const TOPICS = ['All', 'Arrays', 'Strings', 'Trees', 'DP', 'Graphs', 'SQL', 'LinkedList', 'Stack', 'Queue', 'Sorting', 'Binary Search', 'Math'];
const DIFFS = ['All', 'Easy', 'Medium', 'Hard'];

const diffBadge = (d) => {
  if (d === 'Easy') return <span className="badge-easy">{d}</span>;
  if (d === 'Medium') return <span className="badge-medium">{d}</span>;
  return <span className="badge-hard">{d}</span>;
};

export default function Practice() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const topic = searchParams.get('topic') || 'All';
  const difficulty = searchParams.get('difficulty') || 'All';
  const search = searchParams.get('search') || '';

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (topic !== 'All') params.topic = topic;
      if (difficulty !== 'All') params.difficulty = difficulty;
      if (search) params.search = search;
      const { data } = await api.get('/practice/questions', { params });
      setQuestions(data.questions);
      setTotal(data.total);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [topic, difficulty, search, page]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const setFilter = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val === 'All' || !val) p.delete(key); else p.set(key, val);
    setSearchParams(p);
    setPage(1);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Practice</h1>
          <p className="text-slate-400 text-sm mt-1">{total} problems · Real code execution via Piston API</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <input
          className="input"
          placeholder="🔍  Search problems…"
          defaultValue={search}
          onChange={e => { clearTimeout(window._st); window._st = setTimeout(() => setFilter('search', e.target.value), 400); }}
        />
        <div className="flex flex-wrap gap-2">
          <span className="text-slate-500 text-sm self-center">Difficulty:</span>
          {DIFFS.map(d => (
            <button key={d} onClick={() => setFilter('difficulty', d)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${difficulty === d || (d === 'All' && !searchParams.get('difficulty')) ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              {d}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-slate-500 text-sm self-center">Topic:</span>
          {TOPICS.map(t => (
            <button key={t} onClick={() => setFilter('topic', t)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${topic === t || (t === 'All' && !searchParams.get('topic')) ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Title</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Topic</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Difficulty</th>
              <th className="text-right px-4 py-3 text-slate-400 font-medium hidden lg:table-cell">Acceptance</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-16 text-slate-500">Loading…</td></tr>
            ) : questions.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-16 text-slate-500">No problems found</td></tr>
            ) : questions.map((q, i) => (
              <tr key={q._id} className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-900/30'}`}>
                <td className="px-4 py-3">
                  {q.solved ? <span className="text-emerald-400 text-base">✓</span> : <span className="text-slate-700">○</span>}
                  {q.bookmarked && <span className="ml-1 text-amber-400 text-xs">🔖</span>}
                </td>
                <td className="px-4 py-3">
                  <Link to={`/practice/${q._id}`} className="text-white hover:text-indigo-400 font-medium transition-colors">{q.title}</Link>
                </td>
                <td className="px-4 py-3 hidden md:table-cell"><span className="tag">{q.topic}</span></td>
                <td className="px-4 py-3">{diffBadge(q.difficulty)}</td>
                <td className="px-4 py-3 text-right text-slate-500 hidden lg:table-cell">
                  {q.attemptCount > 0 ? `${Math.round((q.solvedCount / q.attemptCount) * 100)}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-4 py-2 text-sm">← Prev</button>
          <span className="px-4 py-2 text-slate-400 text-sm">Page {page} of {Math.ceil(total / 20)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)} className="btn-secondary px-4 py-2 text-sm">Next →</button>
        </div>
      )}
    </div>
  );
}
