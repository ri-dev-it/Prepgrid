import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

// ── Leaderboard ───────────────────────────────────────────────────────────
export function Leaderboard() {
  const { topic } = useParams();
  const [t, setT] = useState(topic || 'React Hooks');
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async (topic) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/quiz/leaderboard/${encodeURIComponent(topic)}`);
      setBoard(data.leaderboard);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(t); }, [t]);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">🏆 Leaderboard</h1>
      <div className="flex gap-3">
        <input className="input flex-1" placeholder="Enter topic to view leaderboard…" value={t} onChange={e => setT(e.target.value)} />
        <button onClick={() => load(t)} className="btn-primary">Search</button>
      </div>
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-800/50">
          <h2 className="font-semibold">{t}</h2>
        </div>
        {loading ? <p className="p-6 text-slate-500 text-center">Loading…</p> : board.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No scores yet for this topic. <Link to="/quiz" className="text-indigo-400">Take a quiz!</Link></div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-800">
              <th className="px-4 py-3 text-left text-slate-400">#</th>
              <th className="px-4 py-3 text-left text-slate-400">Name</th>
              <th className="px-4 py-3 text-right text-slate-400">Best Score</th>
              <th className="px-4 py-3 text-right text-slate-400">Attempts</th>
            </tr></thead>
            <tbody>
              {board.map((r, i) => (
                <tr key={r._id} className={`border-b border-slate-800/50 ${i < 3 ? 'bg-amber-900/10' : ''}`}>
                  <td className="px-4 py-3 font-bold text-slate-400">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
                  <td className="px-4 py-3 text-white font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-right text-indigo-400 font-bold">{r.best}/{r.total || '?'}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{r.attempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Profile ───────────────────────────────────────────────────────────────
export function Profile() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const save = async (e) => {
    e.preventDefault(); setSaving(true); setMsg('');
    try {
      const { data } = await api.put('/user/profile', form);
      updateUser({ ...user, ...form });
      setMsg('Profile updated!');
    } catch {}
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold">{user?.name}</p>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${user?.tier === 'pro' ? 'bg-amber-900/40 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>
              {user?.tier === 'pro' ? '⭐ Pro Member' : 'Free Plan'}
            </span>
          </div>
        </div>
        {msg && <p className="text-emerald-400 text-sm">{msg}</p>}
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Name</label>
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Bio</label>
            <textarea className="input resize-none" rows={3} placeholder="Tell us about yourself…" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Changes'}</button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Problems Solved', value: user?.questionsSolved ?? 0 },
          { label: 'Interviews Done', value: user?.interviewsAttempted ?? 0 },
          { label: 'Current Streak', value: `${user?.streak ?? 0} days 🔥` },
          { label: 'Longest Streak', value: `${user?.longestStreak ?? 0} days` },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4">
            <p className="text-slate-400 text-xs">{label}</p>
            <p className="text-xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Billing ───────────────────────────────────────────────────────────────
export function Billing() {
  const { user, updateUser } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/user/payment/history').then(r => setHistory(r.data.payments)).catch(() => {});
  }, []);

  const upgrade = async (plan) => {
    setUpgrading(true); setMsg('');
    try {
      const { data: order } = await api.post('/user/payment/order', { plan });
      // Sandbox: auto-confirm
      const { data: confirmed } = await api.post('/user/payment/confirm', { orderId: order.orderId });
      setMsg('🎉 ' + confirmed.message);
      updateUser({ ...user, tier: 'pro' });
      const { data } = await api.get('/user/payment/history');
      setHistory(data.payments);
    } catch (e) { setMsg(e.response?.data?.message || 'Payment failed'); }
    setUpgrading(false);
  };

  const isPro = user?.tier === 'pro';

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Billing</h1>

      {msg && <div className={`p-4 rounded-xl border ${msg.startsWith('🎉') ? 'bg-emerald-900/20 border-emerald-700 text-emerald-400' : 'bg-red-900/20 border-red-700 text-red-400'}`}>{msg}</div>}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Free */}
        <div className={`card p-6 space-y-4 ${!isPro ? 'border-indigo-600' : ''}`}>
          <div>
            <h2 className="font-bold text-lg">Free</h2>
            <p className="text-3xl font-bold mt-2">₹0<span className="text-slate-500 text-base font-normal">/mo</span></p>
          </div>
          <ul className="space-y-2 text-sm text-slate-400">
            {['5 AI interviews/month', '10 code submissions/month', 'Unlimited quizzes', 'Leaderboards', 'Practice problems'].map(f => (
              <li key={f} className="flex items-center gap-2"><span className="text-emerald-400">✓</span>{f}</li>
            ))}
          </ul>
          {!isPro && <div className="btn-secondary text-center text-sm py-2 rounded-lg">Current Plan</div>}
        </div>

        {/* Pro */}
        <div className="card p-6 space-y-4 border-amber-600/50 bg-amber-900/5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-bold text-lg">Pro</h2>
              <span className="px-2 py-0.5 text-xs bg-amber-900/40 text-amber-400 rounded-full">Popular</span>
            </div>
            <p className="text-3xl font-bold mt-2 text-amber-400">₹199<span className="text-slate-500 text-base font-normal">/mo</span></p>
            <p className="text-xs text-slate-500 mt-0.5">or ₹999/year (save 58%)</p>
          </div>
          <ul className="space-y-2 text-sm text-slate-400">
            {['Unlimited AI interviews', 'Unlimited submissions', 'All Free features', 'Priority support', 'Badge: Pro Member'].map(f => (
              <li key={f} className="flex items-center gap-2"><span className="text-amber-400">⭐</span>{f}</li>
            ))}
          </ul>
          {isPro ? (
            <div className="bg-amber-900/20 border border-amber-700 text-amber-400 text-center text-sm py-2 rounded-lg font-medium">✓ Active Plan</div>
          ) : (
            <div className="space-y-2">
              <button onClick={() => upgrade('pro_monthly')} disabled={upgrading} className="btn-primary w-full text-sm py-2.5">
                {upgrading ? '⏳ Processing…' : 'Upgrade Monthly — ₹199'}
              </button>
              <button onClick={() => upgrade('pro_yearly')} disabled={upgrading} className="w-full py-2.5 text-sm border border-amber-600 text-amber-400 rounded-lg hover:bg-amber-900/20 transition-colors">
                Upgrade Yearly — ₹999
              </button>
              <p className="text-xs text-slate-600 text-center">Sandbox mode — no real payment</p>
            </div>
          )}
        </div>
      </div>

      {/* Billing history */}
      {history.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800"><h2 className="font-semibold">Billing History</h2></div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-800">
              <th className="px-4 py-3 text-left text-slate-400">Date</th>
              <th className="px-4 py-3 text-left text-slate-400">Plan</th>
              <th className="px-4 py-3 text-right text-slate-400">Amount</th>
              <th className="px-4 py-3 text-right text-slate-400">Status</th>
            </tr></thead>
            <tbody>
              {history.map(p => (
                <tr key={p._id} className="border-b border-slate-800/50">
                  <td className="px-4 py-3 text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-white capitalize">{p.plan?.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-right font-mono">₹{p.amount}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'success' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Admin ──────────────────────────────────────────────────────────────────
export function Admin() {
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', difficulty: 'Easy', topic: 'Arrays', constraints: '', hints: '' });
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (tab === 'stats') api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
    if (tab === 'users') api.get('/admin/users').then(r => setUsers(r.data.users)).catch(() => {});
    if (tab === 'questions') api.get('/admin/questions').then(r => setQuestions(r.data.questions)).catch(() => {});
  }, [tab]);

  const saveQuestion = async () => {
    try {
      const payload = { ...form, hints: form.hints.split('\n').filter(Boolean) };
      if (editing) { await api.put(`/admin/questions/${editing}`, payload); setEditing(null); }
      else { await api.post('/admin/questions', payload); }
      setForm({ title: '', description: '', difficulty: 'Easy', topic: 'Arrays', constraints: '', hints: '' });
      setMsg('Saved!');
      api.get('/admin/questions').then(r => setQuestions(r.data.questions));
    } catch (e) { setMsg(e.response?.data?.message || 'Error'); }
  };

  const deleteQ = async (id) => {
    if (!confirm('Delete this question?')) return;
    await api.delete(`/admin/questions/${id}`);
    setQuestions(qs => qs.filter(q => q._id !== id));
  };

  const TABS = ['stats', 'users', 'questions', 'add'];

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🛡 Admin Panel</h1>
          <Link to="/dashboard" className="btn-ghost text-sm">← Dashboard</Link>
        </div>

        <div className="flex gap-2 flex-wrap">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
              {t === 'add' ? '+ Add Question' : t}
            </button>
          ))}
        </div>

        {msg && <div className="p-3 bg-emerald-900/30 border border-emerald-700 rounded-lg text-emerald-400 text-sm">{msg}</div>}

        {tab === 'stats' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                ['Users', stats.stats.users],
                ['Questions', stats.stats.questions],
                ['Submissions', stats.stats.submissions],
                ['Interviews', stats.stats.sessions],
                ['Quizzes', stats.stats.quizzes],
              ].map(([l, v]) => (
                <div key={l} className="card p-4 text-center">
                  <p className="text-2xl font-bold gradient-text">{v}</p>
                  <p className="text-slate-400 text-xs mt-1">{l}</p>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-5">
                <h3 className="font-semibold mb-3">Top Attempted Questions</h3>
                {stats.topQuestions.map((q, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-slate-800 text-sm last:border-0">
                    <span className="text-slate-300 truncate">{q.title}</span>
                    <span className="text-indigo-400 ml-2 shrink-0">{q.count} attempts</span>
                  </div>
                ))}
              </div>
              <div className="card p-5">
                <h3 className="font-semibold mb-3">Topic Acceptance Rates</h3>
                {stats.topicsAvg.map((t, i) => (
                  <div key={i} className="py-2 border-b border-slate-800 last:border-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{t.topic}</span>
                      <span className={t.rate < 40 ? 'text-red-400' : 'text-emerald-400'}>{t.rate?.toFixed(0)}%</span>
                    </div>
                    <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${t.rate}%`, background: t.rate < 40 ? '#ef4444' : '#10b981' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left text-slate-400">Name</th>
                <th className="px-4 py-3 text-left text-slate-400">Email</th>
                <th className="px-4 py-3 text-center text-slate-400">Tier</th>
                <th className="px-4 py-3 text-center text-slate-400">Solved</th>
                <th className="px-4 py-3 text-center text-slate-400">Interviews</th>
                <th className="px-4 py-3 text-right text-slate-400">Joined</th>
              </tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-slate-400">{u.email}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.tier === 'pro' ? 'bg-amber-900/40 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>{u.tier}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-300">{u.questionsSolved}</td>
                    <td className="px-4 py-3 text-center text-slate-300">{u.interviewsAttempted}</td>
                    <td className="px-4 py-3 text-right text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'questions' && (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left text-slate-400">Title</th>
                <th className="px-4 py-3 text-left text-slate-400">Topic</th>
                <th className="px-4 py-3 text-left text-slate-400">Difficulty</th>
                <th className="px-4 py-3 text-right text-slate-400">Actions</th>
              </tr></thead>
              <tbody>
                {questions.map(q => (
                  <tr key={q._id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                    <td className="px-4 py-3 font-medium">{q.title}</td>
                    <td className="px-4 py-3"><span className="tag">{q.topic}</span></td>
                    <td className="px-4 py-3">
                      <span className={q.difficulty === 'Easy' ? 'badge-easy' : q.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'}>{q.difficulty}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { setEditing(q._id); setForm({ title: q.title, description: q.description, difficulty: q.difficulty, topic: q.topic, constraints: q.constraints || '', hints: (q.hints || []).join('\n') }); setTab('add'); }} className="text-indigo-400 hover:text-indigo-300 text-xs mr-3">Edit</button>
                      <button onClick={() => deleteQ(q._id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'add' && (
          <div className="card p-6 space-y-4 max-w-2xl">
            <h2 className="font-semibold">{editing ? 'Edit Question' : 'Add New Question'}</h2>
            <input className="input" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <textarea className="input resize-none" rows={6} placeholder="Description (supports markdown-like formatting)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <select className="input" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                {['Easy', 'Medium', 'Hard'].map(d => <option key={d}>{d}</option>)}
              </select>
              <select className="input" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}>
                {['Arrays', 'Strings', 'Trees', 'DP', 'Graphs', 'SQL', 'LinkedList', 'Stack', 'Queue', 'Sorting', 'Binary Search', 'Math', 'Other'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <input className="input" placeholder="Constraints (optional)" value={form.constraints} onChange={e => setForm({ ...form, constraints: e.target.value })} />
            <textarea className="input resize-none" rows={3} placeholder="Hints (one per line)" value={form.hints} onChange={e => setForm({ ...form, hints: e.target.value })} />
            <div className="flex gap-3">
              <button onClick={saveQuestion} className="btn-primary">{editing ? 'Save Changes' : 'Add Question'}</button>
              {editing && <button onClick={() => { setEditing(null); setForm({ title: '', description: '', difficulty: 'Easy', topic: 'Arrays', constraints: '', hints: '' }); }} className="btn-ghost">Cancel</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── NotFound ──────────────────────────────────────────────────────────────
export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-center">
      <div>
        <div className="text-8xl font-bold gradient-text mb-4">404</div>
        <p className="text-xl text-slate-400 mb-8">Page not found</p>
        <Link to="/" className="btn-primary px-8 py-3">Go Home</Link>
      </div>
    </div>
  );
}

export default Leaderboard;
