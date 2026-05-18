import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { GraduationCap, User, Mail, Lock, Landmark, Compass, Calendar, AlertTriangle, ArrowRight } from 'lucide-react';

const SignupPage = () => {
  const { register, error, loading, token } = useAuthStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('BMSIT');
  const [branch, setBranch] = useState('Computer Science');
  const [semester, setSemester] = useState(1);
  
  const [formError, setFormError] = useState(null);

  // Skip signup screen if already logged in
  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!name || !email || !password || !college || !branch || !semester) {
      setFormError('Please fill in all mandatory registry slots.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must contain at least 6 characters.');
      return;
    }

    try {
      await register({
        name,
        email,
        password,
        college,
        branch,
        semester: Number(semester)
      });
      navigate('/dashboard');
    } catch (err) {
      // display store errors
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070B13] px-6 py-12 text-slate-100 relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-indigo-600/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-cyan-600/5 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-xl">
        {/* Logo and header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-3 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Initialize StudyMind</h2>
          <p className="mt-1 text-xs text-slate-400">Set up your student profile and unlock core AI study tools</p>
        </div>

        {/* Signup Box */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/10 p-8 backdrop-blur-xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error messaging */}
            {(formError || error) && (
              <div className="flex gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                <span>{formError || error}</span>
              </div>
            )}

            {/* Grid for credentials */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Sumuk"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="sumuk@bmsit.edu"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* College / Institution */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">College / University</label>
                <div className="relative">
                  <Landmark className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500" />
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="BMSIT Engineering"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Engineering Branch */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Engineering Branch</label>
                <div className="relative">
                  <Compass className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Computer Science">Computer Science & Eng</option>
                    <option value="Information Science">Information Science & Eng</option>
                    <option value="Electronics & Communication">Electronics & Comm</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Other Engineering">Other Specialization</option>
                  </select>
                </div>
              </div>

              {/* Current Semester */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Active Semester</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Signup CTA */}
            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50 transition-all duration-200 cursor-pointer pt-3"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  Register Student Account
                  <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Login redirect link */}
          <p className="mt-6 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
