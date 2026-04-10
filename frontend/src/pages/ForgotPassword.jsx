import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const sendOTP = async (e) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      await api.post('/auth/forgot-password', { email });
      setMsg('OTP sent to your email'); setStep(2);
    } catch (e) { setErr(e.response?.data?.message || 'Error'); }
    setLoading(false);
  };

  const resetPass = async (e) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setMsg('Password reset! You can now sign in.'); setStep(3);
    } catch (e) { setErr(e.response?.data?.message || 'Invalid OTP'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">⚡</span>
            <span className="text-2xl font-bold gradient-text">PrepGrid</span>
          </Link>
          <h1 className="text-2xl font-bold">Reset Password</h1>
        </div>
        <div className="card p-8 glow">
          {msg && <div className="p-3 mb-4 bg-emerald-900/30 border border-emerald-700 rounded-lg text-emerald-400 text-sm">{msg}</div>}
          {err && <div className="p-3 mb-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">{err}</div>}

          {step === 1 && (
            <form onSubmit={sendOTP} className="space-y-4">
              <p className="text-slate-400 text-sm">Enter your email and we'll send an OTP.</p>
              <input className="input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              <button className="btn-primary w-full py-3" disabled={loading}>{loading ? 'Sending…' : 'Send OTP'}</button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={resetPass} className="space-y-4">
              <p className="text-slate-400 text-sm">Enter the 6-digit OTP sent to <strong className="text-white">{email}</strong></p>
              <input className="input text-center text-2xl font-mono tracking-widest" type="text" placeholder="000000" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} required />
              <input className="input" type="password" placeholder="New password (min 6 chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
              <button className="btn-primary w-full py-3" disabled={loading}>{loading ? 'Resetting…' : 'Reset Password'}</button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <Link to="/login" className="btn-primary px-8 py-3">Sign In Now</Link>
            </div>
          )}

          <p className="text-center mt-6 text-slate-500 text-sm">
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300">← Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
