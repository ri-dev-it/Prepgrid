import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const StatCard = ({ icon, label, value, sub, color = 'indigo' }) => (
  <div className="card p-5 flex items-start gap-4">
    <div className={`w-11 h-11 rounded-xl bg-${color}-600/20 flex items-center justify-center text-xl flex-shrink-0`}>{icon}</div>
    <div>
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-2xl font-bold text-white mt-0.5">{value ?? '—'}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const diffBadge = (d) => {
  if (d === 'Easy') return <span className="badge-easy">{d}</span>;
  if (d === 'Medium') return <span className="badge-medium">{d}</span>;
  return <span className="badge-hard">{d}</span>;
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/user/dashboard').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-500">Loading dashboard…</div>;

  const u = data?.user || user;
  const free = u?.tier === 'free';
  const interviewsLeft = free ? Math.max(0, 5 - (u?.monthlyInterviews || 0)) : '∞';
  const practiceLeft = free ? Math.max(0, 10 - (u?.monthlyPractice || 0)) : '∞';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hey, {u?.name?.split(' ')[0]} 👋</h1>
          <p className="text-slate-400 mt-1">Track your progress and keep the streak alive!</p>
        </div>
        {u?.streak > 0 && (
          <div className="card px-5 py-3 flex items-center gap-3 border-orange-800/50">
            <span className="text-3xl">🔥</span>
            <div>
              <p className="text-xl font-bold text-orange-400">{u.streak} day streak</p>
              <p className="text-xs text-slate-500">Longest: {u.longestStreak || u.streak} days</p>
            </div>
          </div>
        )}
      </div>

      {/* Free tier warning */}
      {free && (
        <div className="flex items-center justify-between gap-4 p-4 bg-amber-900/20 border border-amber-700/50 rounded-xl">
          <div>
            <p className="text-amber-400 font-medium">Free Tier</p>
            <p className="text-slate-400 text-sm">{interviewsLeft} AI interviews · {practiceLeft} submissions left this month</p>
          </div>
          <Link to="/billing" className="btn-primary text-sm shrink-0">Upgrade to Pro</Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="✅" label="Problems Solved" value={u?.questionsSolved} color="emerald" />
        <StatCard icon="🎯" label="Interviews Done" value={u?.interviewsAttempted} color="indigo" />
        <StatCard icon="⭐" label="Avg Interview Score" value={u?.averageInterviewScore ? `${u.averageInterviewScore.toFixed(1)}/10` : '—'} color="amber" />
        <StatCard icon="📝" label="Total Submissions" value={u?.totalSubmissions} color="purple" />
      </div>

      {/* Weak areas */}
      {data?.weakAreas?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold mb-3 text-slate-300">🔴 Weak Areas — Focus Here</h2>
          <div className="flex flex-wrap gap-2">
            {data.weakAreas.map(area => (
              <Link key={area} to={`/practice?topic=${area}`} className="tag hover:border-indigo-600 hover:text-indigo-400 transition-colors cursor-pointer">
                {area}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Submissions</h2>
            <Link to="/practice" className="text-indigo-400 text-sm hover:text-indigo-300">View all →</Link>
          </div>
          {data?.recentSubmissions?.length ? (
            <div className="space-y-2">
              {data.recentSubmissions.slice(0, 6).map((s) => (
                <div key={s._id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                  <div className="min-w-0">
                    <Link to={`/practice/${s.question?._id}`} className="text-sm text-slate-300 hover:text-white truncate block">{s.question?.title}</Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      {diffBadge(s.question?.difficulty)}
                      <span className="tag text-xs">{s.question?.topic}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-medium shrink-0 ml-2 ${s.status === 'Accepted' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {s.status === 'Accepted' ? '✓ AC' : '✗ ' + s.status.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">No submissions yet</p>
              <Link to="/practice" className="btn-primary text-sm mt-3 inline-block">Start Practicing</Link>
            </div>
          )}
        </div>

        {/* Recent Interviews */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Interviews</h2>
            <Link to="/interview/history" className="text-indigo-400 text-sm hover:text-indigo-300">View all →</Link>
          </div>
          {data?.recentSessions?.length ? (
            <div className="space-y-2">
              {data.recentSessions.map((s) => (
                <div key={s._id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                  <div>
                    <p className="text-sm text-slate-300">{s.role} Interview</p>
                    <p className="text-xs text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-indigo-400">{s.averageScore?.toFixed(1) ?? '—'}/10</p>
                    <span className={`text-xs ${s.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}`}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">No interviews yet</p>
              <Link to="/interview" className="btn-primary text-sm mt-3 inline-block">Start Interview</Link>
            </div>
          )}
        </div>
      </div>

      {/* Bookmarks */}
      {u?.bookmarkedQuestions?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold mb-3">🔖 Bookmarked Questions</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {u.bookmarkedQuestions.slice(0, 6).map((q) => (
              <Link key={q._id} to={`/practice/${q._id}`} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                <span className="text-sm text-slate-300 truncate">{q.title}</span>
                {diffBadge(q.difficulty)}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: '/practice', icon: '⌨', label: 'Practice DSA', desc: 'Solve coding problems' },
          { to: '/interview', icon: '🎯', label: 'Mock Interview', desc: 'AI-powered sessions' },
          { to: '/quiz', icon: '📝', label: 'Take a Quiz', desc: 'Test your knowledge' },
        ].map(({ to, icon, label, desc }) => (
          <Link key={to} to={to} className="card p-5 hover:border-indigo-700 hover:glow transition-all text-center">
            <div className="text-3xl mb-2">{icon}</div>
            <p className="font-semibold">{label}</p>
            <p className="text-slate-500 text-xs mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
