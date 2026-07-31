import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { forgotPassword as apiForgotPassword, resetPassword as apiResetPassword, verifyOtp as apiVerifyOtp, logAnalyticsEvent } from '../services/api';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineArrowRight, HiOutlineLightningBolt, HiOutlineExclamationCircle, HiOutlineKey, HiOutlineShieldCheck, HiOutlineX } from 'react-icons/hi';
import SEO from '../components/SEO';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/app/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        logAnalyticsEvent('user_google_login_success', {});
        navigate('/app/dashboard');
      }
    } catch (err) {
      logAnalyticsEvent('user_google_login_failed', { error: err.message });
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1 = enter email, 2 = show OTP popup, 3 = show new password form
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Helper to calculate password strength
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'Very Weak', color: 'bg-slate-200', text: 'text-slate-400' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score, label: 'Weak 🔴', color: 'bg-red-500', text: 'text-red-500' };
    if (score === 3 || score === 4) return { score, label: 'Medium 🟡', color: 'bg-amber-500', text: 'text-amber-500' };
    return { score, label: 'Strong 🟢', color: 'bg-emerald-500', text: 'text-emerald-500' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        logAnalyticsEvent('user_login_success', { email });
        navigate('/app/dashboard');
      }
    } catch (err) {
      logAnalyticsEvent('user_login_failed', { email, error: err.message || 'Login failed' });
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetOtp = async (e) => {
    e?.preventDefault();
    setResetError('');
    if (!resetEmail.trim()) {
      setResetError('Please enter your email address');
      return;
    }
    setSendingOtp(true);
    try {
      const { data } = await apiForgotPassword({ email: resetEmail.trim() });
      if (data && (data.success || data.message)) {
        toast.success(data.message || 'Verification OTP code sent to your email!');
        setResetStep(2); // opens the OTP popup modal
      } else {
        setResetError('Failed to send OTP verification code. Please try again.');
      }
    } catch (err) {
      setResetError(err.response?.data?.error || "You haven't account. Please sign up or check your email.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setResetError('');
    if (!otp.trim() || otp.length < 6) {
      setResetError('Please enter a valid 6-digit OTP code');
      return;
    }
    setVerifyingOtp(true);
    try {
      const { data } = await apiVerifyOtp({ email: resetEmail.trim(), otp: otp.trim() });
      if (data.success) {
        toast.success('OTP verified successfully!');
        setResetStep(3); // transition to Change Password card form
      }
    } catch (err) {
      setResetError(err.response?.data?.error || 'Invalid or expired OTP verification code');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    if (!newPassword) {
      setResetError('New password cannot be empty');
      return;
    }
    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setResetError('Passwords do not match');
      return;
    }

    setUpdatingPassword(true);
    try {
      const { data } = await apiResetPassword({
        email: resetEmail.trim(),
        otp: otp.trim(),
        password: newPassword,
      });
      if (data.success) {
        toast.success('Password changed successfully! You can now log in.');
        setNewPassword('');
        setConfirmNewPassword('');
        setOtp('');
        setResetStep(1);
        setResetEmail('');
        setShowForgotPassword(false);
      }
    } catch (err) {
      setResetError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8 animate-fadeIn">
      <SEO title="Sign In" />
      <div className="max-w-md w-full space-y-8 glass-card p-10 bg-white border border-slate-200 shadow-xl rounded-3xl">
        
        {!showForgotPassword ? (
          /* ================= SIGN IN VIEW ================= */
          <>
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-5 shadow-sm text-indigo-600">
                <HiOutlineLightningBolt className="w-7 h-7" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-500">
                Sign in to manage your bills and view analytics
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-shake">
                <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
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
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="password" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetError('');
                        setResetEmail(email); // autofill email if typed
                        setShowForgotPassword(true);
                      }}
                      className="text-[11px] font-extrabold text-indigo-600 hover:text-indigo-500 transition-colors uppercase tracking-wider"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <HiOutlineLockClosed className="absolute left-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
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
                  disabled={loading || googleLoading}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <HiOutlineArrowRight className="w-5 h-5 ml-1 animate-pulse" />
                    </>
                  )}
                </button>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full py-3 px-4 flex items-center justify-center gap-3 font-semibold text-sm text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-indigo-200 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {googleLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-6 pt-6 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                  Sign up for free
                </Link>
              </p>
            </div>
          </>
        ) : (
          /* ================= FORGOT PASSWORD / RESET PASSWORD VIEWS ================= */
          <>
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-5 shadow-sm text-indigo-600">
                <HiOutlineKey className="w-7 h-7" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reset password</h2>
              <p className="mt-2 text-sm text-slate-500">
                {resetStep <= 2 
                  ? "Enter your email address and we'll send you an OTP verification code"
                  : "Enter the OTP code received and configure your new password"
                }
              </p>
            </div>

            {resetStep <= 2 ? (
              /* Step 1 & 2: Enter Email (Modal popup renders if step 2) */
              <form className="mt-8 space-y-6" onSubmit={handleSendResetOtp}>
                {resetError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-shake">
                    <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}
                
                <div>
                  <label htmlFor="reset-email" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Email address
                  </label>
                  <div className="relative flex items-center">
                    <HiOutlineMail className="absolute left-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                    <input
                      id="reset-email"
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full bg-white text-slate-900 placeholder:text-slate-400/80 border border-slate-200 rounded-xl py-3 pl-11 pr-11 text-sm focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm"
                      placeholder="name@company.com"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={sendingOtp}
                    className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-bold text-base disabled:opacity-50 rounded-xl shadow-lg"
                  >
                    {sendingOtp ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      'Send Verification OTP'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResetError('');
                      setShowForgotPassword(false);
                    }}
                    className="w-full text-center py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            ) : (
              /* Step 3: Enter New Password */
              <form className="mt-8 space-y-5" onSubmit={handleResetPassword}>
                <div className="space-y-4">
                  {resetError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-shake">
                      <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />
                      <span>{resetError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <div className="relative flex items-center">
                      <HiOutlineLockClosed className="absolute left-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-white text-slate-900 placeholder:text-slate-400/80 border border-slate-200 rounded-xl py-3 pl-11 pr-11 text-sm focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
                      >
                        {showNewPassword ? (
                          <HiOutlineEyeOff className="w-4.5 h-4.5" />
                        ) : (
                          <HiOutlineEye className="w-4.5 h-4.5" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="mt-2.5 space-y-1.5 animate-fadeIn">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-slate-400 uppercase tracking-wider">Password Strength:</span>
                          <span className={getPasswordStrength(newPassword).text}>
                            {getPasswordStrength(newPassword).label}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 h-1">
                          <div className={`h-full rounded-full transition-colors ${
                            getPasswordStrength(newPassword).score >= 1 ? getPasswordStrength(newPassword).color : 'bg-slate-100'
                          }`} />
                          <div className={`h-full rounded-full transition-colors ${
                            getPasswordStrength(newPassword).score >= 3 ? getPasswordStrength(newPassword).color : 'bg-slate-100'
                          }`} />
                          <div className={`h-full rounded-full transition-colors ${
                            getPasswordStrength(newPassword).score >= 5 ? getPasswordStrength(newPassword).color : 'bg-slate-100'
                          }`} />
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          For strong passwords, include uppercase, lowercase, numbers, and special symbols.
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative flex items-center">
                      <HiOutlineLockClosed className="absolute left-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                      <input
                        type={showConfirmNewPassword ? 'text' : 'password'}
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full bg-white text-slate-900 placeholder:text-slate-400/80 border border-slate-200 rounded-xl py-3 pl-11 pr-11 text-sm focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
                      >
                        {showConfirmNewPassword ? (
                          <HiOutlineEyeOff className="w-4.5 h-4.5" />
                        ) : (
                          <HiOutlineEye className="w-4.5 h-4.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-bold text-base disabled:opacity-50 rounded-xl shadow-lg"
                  >
                    {updatingPassword ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Resetting password...
                      </>
                    ) : (
                      'Verify & Reset Password'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResetError('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                      setOtp('');
                      setResetStep(1);
                      setShowForgotPassword(false);
                    }}
                    className="w-full text-center py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Cancel & Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>

      {/* ================= ANIMATED OTP POPUP MODAL ================= */}
      {showForgotPassword && resetStep === 2 && createPortal(
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-100 shadow-2xl relative animate-scaleUp">
            <button
              type="button"
              onClick={() => {
                setResetError('');
                setResetStep(1);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>

            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto shadow-sm text-indigo-600">
                <HiOutlineShieldCheck className="w-6 h-6" />
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-lg font-extrabold text-slate-900">Enter Verification Code</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We sent a 6-digit OTP code to <strong className="text-indigo-600 font-bold block mt-0.5">{resetEmail}</strong>
                </p>
              </div>

              {resetError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-shake">
                  <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />
                  <span className="text-left">{resetError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
                <div className="relative">
                  <HiOutlineShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500 w-5 h-5 pointer-events-none" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 text-slate-950 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-center text-lg font-bold tracking-widest focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-inner font-mono placeholder:text-slate-300"
                    placeholder="000000"
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifyingOtp}
                  className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 font-bold text-sm rounded-xl shadow-lg bg-indigo-600 hover:bg-indigo-700"
                >
                  {verifyingOtp ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP Code'
                  )}
                </button>
              </form>

              <div className="flex justify-between items-center text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setResetError('');
                    setResetStep(1);
                  }}
                  className="font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSendResetOtp}
                  disabled={sendingOtp}
                  className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Resend Code
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default LoginPage;
