import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineArrowRight, HiOutlineLightningBolt, HiOutlineExclamationCircle } from 'react-icons/hi';
import SEO from '../components/SEO';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/app/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const success = await register(name, email, password);
      if (success) {
        navigate('/app/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8 animate-fadeIn">
      <SEO title="Create Account" />
      <div className="max-w-md w-full space-y-8 glass-card p-10 bg-white border border-slate-200 shadow-xl rounded-3xl">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-5 shadow-sm text-indigo-600">
            <HiOutlineLightningBolt className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create your account</h2>
          <p className="mt-2 text-sm text-slate-500">
            Start automating your invoice data extraction today
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-1.5">
            <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative flex items-center">
                <HiOutlineUser className="absolute left-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white text-slate-900 placeholder:text-slate-400/80 border border-slate-200 rounded-xl py-3 pl-11 pr-11 text-sm focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email-address" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Email address
              </label>
              <div className="relative flex items-center">
                <HiOutlineMail className="absolute left-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white text-slate-900 placeholder:text-slate-400/80 border border-slate-200 rounded-xl py-3 pl-11 pr-11 text-sm focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative flex items-center">
                <HiOutlineLockClosed className="absolute left-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white text-slate-900 placeholder:text-slate-400/80 border border-slate-200 rounded-xl py-3 pl-11 pr-11 text-sm focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
                >
                  {showPassword ? (
                    <HiOutlineEyeOff className="w-4 h-4" />
                  ) : (
                    <HiOutlineEye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Get Started
                  <HiOutlineArrowRight className="w-5 h-5 ml-1 animate-pulse" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
