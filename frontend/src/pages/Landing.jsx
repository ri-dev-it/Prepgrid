import { Link } from 'react-router-dom';

const features = [
  { icon: '⌨', title: 'Code Practice', desc: '100+ DSA problems with real code execution via Piston API. 5 languages supported.' },
  { icon: '🎯', title: 'AI Mock Interviews', desc: 'Adaptive interviews powered by Groq (free LLaMA 3). Score, feedback, and summary after 10 questions.' },
  { icon: '📝', title: 'Timed Quizzes', desc: 'AI-generated MCQ tests on any topic. Instant results with explanations and leaderboards.' },
  { icon: '🔥', title: 'Streak Tracking', desc: 'Daily login streaks, question stats, weak area analysis, and personalized dashboard.' },
  { icon: '🏆', title: 'Leaderboards', desc: 'Compete with others on any topic. See where you stand.' },
  { icon: '🆓', title: '100% Free Stack', desc: 'Groq AI + Piston + MongoDB Atlas + Render + Vercel. Zero cost, no credit card.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-800 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-bold gradient-text">PrepGrid</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-900/30 border border-indigo-700/50 text-indigo-400 text-sm font-medium mb-8">
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
          Powered by Groq LLaMA 3 · Piston · 100% Free
        </div>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          Ace Your
          <span className="gradient-text block">Tech Interviews</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
          Practice DSA problems with real code execution, take AI-powered mock interviews, and track your progress — all completely free.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="btn-primary text-base px-8 py-3 glow">Start Practicing Free →</Link>
          <Link to="/login" className="btn-secondary text-base px-8 py-3">Sign In</Link>
        </div>
        <p className="mt-4 text-slate-600 text-sm">No credit card required · Free forever</p>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-3 gap-6">
          {[['100+', 'DSA Problems'], ['5', 'Languages'], ['∞', 'AI Quizzes']].map(([v, l]) => (
            <div key={l} className="card p-6 text-center glow">
              <div className="text-4xl font-bold gradient-text">{v}</div>
              <div className="text-slate-400 mt-1 text-sm">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to <span className="gradient-text">get hired</span></h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card p-6 hover:border-indigo-700 transition-colors">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <div className="card p-10 glow border-indigo-800/50">
          <h2 className="text-3xl font-bold mb-4">Ready to start?</h2>
          <p className="text-slate-400 mb-8">Join thousands of developers preparing for their dream jobs.</p>
          <Link to="/register" className="btn-primary text-base px-10 py-3">Create Free Account →</Link>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8 text-center text-slate-600 text-sm">
        PrepGrid · Built for DevFusion Hackathon · Free & Open Source
      </footer>
    </div>
  );
}
