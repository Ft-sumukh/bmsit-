import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { GraduationCap, Mail, Lock, AlertTriangle, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const { login, error, loading, token } = useAuthStore();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(null);

  // If already authenticated, bypass login
  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError('Please fill in all credentials.');
      return;
    }

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      // Handled inside authStore state, displays below
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070B13] px-6 py-12 text-slate-100 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-indigo-600/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-cyan-600/5 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md">
        {/* Logo and Greeting */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-3 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h2>
          <p className="mt-1 text-xs text-slate-400">Log in to sync your engineering notes and dashboards</p>
        </div>

        {/* Login Box */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/10 p-8 backdrop-blur-xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Error Indicators */}
            {(formError || error) && (
              <div className="flex gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                <span>{formError || error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                  placeholder="sumuk@bmsit.edu"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400">Password</label>
                <Link to="#" className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Login CTA */}
            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50 transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  Verify Credentials
                  <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Signup Redirect link */}
          <p className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-indigo-400 hover:text-indigo-300">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
