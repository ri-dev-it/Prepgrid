import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const refresh = searchParams.get('refresh');
    if (token && refresh) {
      localStorage.setItem('token', token);
      localStorage.setItem('refresh', refresh);
      const userData = { _id: 'google', name: 'Google User', email: '' };
      localStorage.setItem('user', JSON.stringify(userData));
      useAuthStore.setState({ user: userData, token });
      navigate('/dashboard', { replace: true });
    }
    const errorMsg = searchParams.get('error');
    if (errorMsg) {
      useAuthStore.setState({ error: errorMsg.replace(/\+/g, ' ') });
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const ok = await login(form.email, form.password);
    if (ok) navigate('/dashboard');
  };

  const getApiUrl = () => {
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    return baseUrl.replace(/\/+$/, '');
  };

  const handleGoogleLogin = () => {
    window.location.href = `${getApiUrl()}/auth/google`;
  };

  return (
    <AuthLayout title="Welcome back" sub="Sign in to PrepGrid">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">{error}</div>}
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Email</label>
          <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Password</label>
          <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300">Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
      <div className="mt-4">
        <button type="button" onClick={handleGoogleLogin} className="btn-secondary w-full py-3 flex items-center justify-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </div>
      <p className="text-center text-slate-500 text-sm mt-6">
        No account? <Link to="/register" className="text-indigo-400 hover:text-indigo-300">Create one free</Link>
      </p>
    </AuthLayout>
  );
}

export function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const ok = await register(form.name, form.email, form.password);
    if (ok) navigate('/dashboard');
  };

  return (
    <AuthLayout title="Create account" sub="Join PrepGrid for free">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">{error}</div>}
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Full Name</label>
          <input className="input" type="text" placeholder="Rahul Kumar" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Email</label>
          <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Password</label>
          <input className="input" type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Creating account…' : 'Create Free Account'}
        </button>
      </form>
      <p className="text-center text-slate-500 text-sm mt-6">
        Have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Sign in</Link>
      </p>
    </AuthLayout>
  );
}

function AuthLayout({ title, sub, children }) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">⚡</span>
            <span className="text-2xl font-bold gradient-text">PrepGrid</span>
          </Link>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-slate-500 mt-1">{sub}</p>
        </div>
        <div className="card p-8 glow">{children}</div>
      </div>
    </div>
  );
}

export default Login;
