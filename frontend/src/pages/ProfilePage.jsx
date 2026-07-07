import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { updateProfile, getInvoices, downloadInvoice, forgotPassword as apiForgotPassword, resetPassword as apiResetPassword, verifyOtp as apiVerifyOtp } from '../services/api';
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineKey,
  HiOutlineCreditCard,
  HiOutlineCog,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineDownload,
  HiOutlineArrowRight,
  HiOutlineBell,
  HiOutlineLightningBolt,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  
  // Tab control: 'profile' | 'billing' | 'preferences'
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Security password states (OTP popup and step flow)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [securityStep, setSecurityStep] = useState(1); // 1 = show verification banner, 2 = show OTP modal popup, 3 = show password inputs
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [securityError, setSecurityError] = useState('');

  // Invoices state
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  // App preferences state (loaded from localStorage for persistence)
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('dashboard_preferences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Error parsing stored preferences:', err);
      }
    }
    return {
      scanAccuracy: 'high', // 'high' | 'fast'
      defaultExport: 'csv', // 'csv' | 'excel' | 'json'
      emailOnComplete: true,
      weeklyReport: false,
    };
  });

  // Sync state with user context on load/change
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // Load invoices if billing tab is open
  useEffect(() => {
    if (activeTab === 'billing') {
      fetchInvoices();
    }
  }, [activeTab]);

  const fetchInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const { data } = await getInvoices();
      if (data.success) {
        setInvoices(data.data);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      setDownloadingId(invoiceId);
      const { data } = await downloadInvoice(invoiceId);
      
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice receipt downloaded.');
    } catch (err) {
      console.error('Failed to download invoice:', err);
      toast.error('Failed to download invoice PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Name and email cannot be empty');
      return;
    }

    setUpdatingProfile(true);
    try {
      const { data } = await updateProfile({ name, email });
      if (data.success) {
        toast.success('Profile details updated successfully!');
        await refreshUser();
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to update profile';
      toast.error(errMsg);
    } finally {
      setUpdatingProfile(false);
    }
  };

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

  const handleSendOtp = async () => {
    if (!user?.email) return;
    setSendingOtp(true);
    setSecurityError('');
    try {
      const { data } = await apiForgotPassword({ email: user.email });
      if (data.success) {
        toast.success('Verification OTP code sent to your email!');
        setSecurityStep(2); // opens the OTP popup modal
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to send OTP';
      toast.error(errMsg);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setSecurityError('');
    if (!otp.trim() || otp.length < 6) {
      setSecurityError('Please enter a valid 6-digit OTP code');
      return;
    }
    setVerifyingOtp(true);
    try {
      const { data } = await apiVerifyOtp({ email: user.email, otp: otp.trim() });
      if (data.success) {
        toast.success('OTP verified successfully!');
        setSecurityStep(3); // close modal and transition to Password Change fields
      }
    } catch (err) {
      setSecurityError(err.response?.data?.error || 'Invalid or expired OTP verification code');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleVerifyAndChangePassword = async (e) => {
    e.preventDefault();
    setSecurityError('');
    if (!password) {
      setSecurityError('Password cannot be empty');
      return;
    }
    if (password.length < 6) {
      setSecurityError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setSecurityError('Passwords do not match');
      return;
    }

    setUpdatingPassword(true);
    try {
      const { data } = await apiResetPassword({
        email: user.email,
        otp: otp.trim(),
        password,
      });
      if (data.success) {
        toast.success('Password changed successfully!');
        setPassword('');
        setConfirmPassword('');
        setOtp('');
        setSecurityStep(1);
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Password update failed';
      setSecurityError(errMsg);
      toast.error(errMsg);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handlePreferenceChange = (key, val) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: val };
      localStorage.setItem('dashboard_preferences', JSON.stringify(updated));
      return updated;
    });
    toast.success('Preferences updated successfully!');
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const userPlan = user?.subscription?.plan || 'Starter';

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-10">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage your profile, security settings, subscription billing, and application preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Profile Card & Navigation */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 bg-white border border-slate-200 shadow-sm rounded-3xl relative overflow-hidden text-center">
            {/* Colorful Banner Background */}
            <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            {/* Avatar Section */}
            <div className="relative pt-12 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg ring-4 ring-indigo-50/50">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white text-2xl font-extrabold shadow-inner">
                  {getInitials()}
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="mt-4 space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900">{user?.name}</h3>
              <p className="text-xs text-slate-400 font-semibold">{user?.email}</p>
            </div>

            {/* Subscription Badge */}
            <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs">
              <HiOutlineSparkles className="w-3.5 h-3.5" />
              <span>{userPlan} Tier</span>
            </div>

            <div className="h-px bg-slate-100 my-6" />

            {/* Navigation Tabs List */}
            <nav className="space-y-1">
              {[
                { id: 'profile', name: 'Profile & Security', icon: HiOutlineUser },
                { id: 'billing', name: 'Billing & Invoices', icon: HiOutlineCreditCard },
                { id: 'preferences', name: 'App Preferences', icon: HiOutlineCog },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Stats Summary Card */}
          <div className="glass-card p-5 bg-white border border-slate-200 shadow-sm rounded-3xl space-y-4">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Quick Actions</h4>
            <div className="grid grid-cols-1 gap-2.5">
              <Link
                to="/subscription"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors text-xs font-bold text-slate-700"
              >
                <div className="flex items-center gap-2">
                  <HiOutlineCreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Upgrade/Manage Plan</span>
                </div>
                <HiOutlineArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/support"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors text-xs font-bold text-slate-700"
              >
                <div className="flex items-center gap-2">
                  <HiOutlineShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Get Technical Support</span>
                </div>
                <HiOutlineArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Tab View Contents */}
        <div className="lg:col-span-8">
          {/* PROFILE & SECURITY TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Details Form */}
              <div className="glass-card p-6 bg-white border border-slate-200 shadow-sm rounded-3xl space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">Personal Information</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Update your dashboard credentials and email address</p>
                </div>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Full Name</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                          <HiOutlineUser className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="input-field pl-10"
                          placeholder="Your Name"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Email Address</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                          <HiOutlineMail className="w-4 h-4" />
                        </span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="input-field pl-10"
                          placeholder="name@company.com"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={updatingProfile}
                      className="btn-primary text-xs py-2.5 flex items-center gap-1.5"
                    >
                      {updatingProfile ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Profile Changes'
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Password Change Form */}
              <div className="glass-card p-6 bg-white border border-slate-200 shadow-sm rounded-3xl space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">Security & Authentication</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Keep your account safe by verifying your email and updating your password periodically</p>
                </div>

                {securityStep <= 2 ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-start gap-3">
                      <span className="p-2 rounded-xl bg-indigo-600/10 text-indigo-600 shrink-0">
                        <HiOutlineKey className="w-5 h-5" />
                      </span>
                      <div className="space-y-1">
                        <h4 className="text-xs font-extrabold text-slate-800">Verification Required</h4>
                        <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                          To protect your account, changing your password requires verifying your identity. We will send a 6-digit One-Time Password (OTP) to your registered email address: <strong className="text-indigo-600 font-bold">{user?.email}</strong>.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp}
                        className="btn-primary text-xs py-2.5 flex items-center gap-1.5"
                      >
                        {sendingOtp ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending OTP...
                          </>
                        ) : (
                          'Send Verification OTP'
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyAndChangePassword} className="space-y-4">
                    {securityError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-shake mb-2">
                        <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />
                        <span>{securityError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">New Password</label>
                        <div className="relative flex items-center">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                            <HiOutlineKey className="w-4 h-4" />
                          </span>
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field pl-10 pr-10"
                            placeholder="Min. 6 characters"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
                          >
                            {showNewPassword ? (
                              <HiOutlineEyeOff className="w-4 h-4" />
                            ) : (
                              <HiOutlineEye className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {password && (
                          <div className="mt-2 space-y-1 animate-fadeIn">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-slate-400 uppercase tracking-wider">Password Strength:</span>
                              <span className={getPasswordStrength(password).text}>
                                {getPasswordStrength(password).label}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-1 h-1">
                              <div className={`h-full rounded-full transition-colors ${
                                getPasswordStrength(password).score >= 1 ? getPasswordStrength(password).color : 'bg-slate-100'
                              }`} />
                              <div className={`h-full rounded-full transition-colors ${
                                getPasswordStrength(password).score >= 3 ? getPasswordStrength(password).color : 'bg-slate-100'
                              }`} />
                              <div className={`h-full rounded-full transition-colors ${
                                getPasswordStrength(password).score >= 5 ? getPasswordStrength(password).color : 'bg-slate-100'
                              }`} />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                        <div className="relative flex items-center">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                            <HiOutlineKey className="w-4 h-4" />
                          </span>
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input-field pl-10 pr-10"
                            placeholder="Repeat new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
                          >
                            {showConfirmPassword ? (
                              <HiOutlineEyeOff className="w-4 h-4" />
                            ) : (
                              <HiOutlineEye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSecurityError('');
                          setPassword('');
                          setConfirmPassword('');
                          setOtp('');
                          setSecurityStep(1);
                        }}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updatingPassword}
                        className="btn-primary text-xs py-2.5 bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1.5 shadow-none"
                      >
                        {updatingPassword ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Verify & Update Password'
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* ================= ANIMATED OTP POPUP MODAL ================= */}
                {securityStep === 2 && (
                  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-100 shadow-2xl relative animate-scaleUp">
                      <button
                        type="button"
                        onClick={() => {
                          setSecurityError('');
                          setSecurityStep(1);
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
                            We sent a 6-digit OTP code to <strong className="text-indigo-600 font-bold block mt-0.5">{user?.email}</strong>
                          </p>
                        </div>

                        {securityError && (
                          <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-shake">
                            <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />
                            <span className="text-left">{securityError}</span>
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
                              setSecurityError('');
                              setSecurityStep(1);
                            }}
                            className="font-bold text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={sendingOtp}
                            className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                          >
                            Resend Code
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BILLING & INVOICES TAB */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              {/* Plan Status Details Card */}
              <div className="glass-card p-6 bg-white border border-slate-200 shadow-sm rounded-3xl space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">Subscription Status</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Overview of active SaaS quotas, payment frequency, and subscription renew date</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 border border-slate-100 rounded-2xl p-5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Current Tier</span>
                    <p className="text-lg font-extrabold text-indigo-600 flex items-center gap-1">
                      {userPlan === 'Pro' || userPlan === 'Enterprise' ? (
                        <HiOutlineSparkles className="w-5 h-5 text-indigo-500 animate-pulse-glow" />
                      ) : (
                        <HiOutlineShieldCheck className="w-5 h-5 text-slate-500" />
                      )}
                      <span>{userPlan} Plan</span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Billing Frequency</span>
                    <p className="text-base font-bold text-slate-700 capitalize">
                      {user?.subscription?.billingPeriod || 'Monthly'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Renewal Date</span>
                    <p className="text-base font-bold text-slate-700">
                      {user?.subscription?.startDate ? new Date(new Date(user.subscription.startDate).setMonth(new Date(user.subscription.startDate).getMonth() + 1)).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' }) : 'Next Month'}
                    </p>
                  </div>
                </div>

                {/* Quota Progress meter */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-600 flex items-center gap-1">
                      <HiOutlineLightningBolt className="w-4 h-4 text-amber-500" /> Usage Quota
                    </span>
                    <span className="text-slate-800">
                      {userPlan === 'Starter' ? '12 / 50' : userPlan === 'Pro' ? '145 / 1,500' : 'Unlimited'} scans this cycle
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5">
                    <div
                      style={{ width: userPlan === 'Starter' ? '24%' : userPlan === 'Pro' ? '9.6%' : '100%' }}
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-sm"
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>0 Scans</span>
                    <span>{userPlan === 'Starter' ? '50 Scans limit' : userPlan === 'Pro' ? '1,500 Scans limit' : 'Unlimited Scans'}</span>
                  </div>
                </div>
              </div>

              {/* Billing History / Invoices list */}
              <div className="glass-card p-6 bg-white border border-slate-200 shadow-sm rounded-3xl space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">Invoices & Receipts</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Download PDF statements for payment transactions and tax records</p>
                </div>

                <div className="divide-y divide-slate-100">
                  {loadingInvoices ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                      <div className="w-5 h-5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Loading receipts...</p>
                    </div>
                  ) : invoices.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs font-semibold">
                      No invoices found. Upgraded subscriptions generate official receipts.
                    </div>
                  ) : (
                    invoices.map((inv) => (
                      <div key={inv.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{inv.plan} Subscription</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            {inv.date} &bull; <span className="font-mono">{inv.id}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-extrabold text-slate-900">
                            {inv.amount > 0 ? `₹${inv.amount.toLocaleString('en-IN')}` : 'Free'}
                          </span>
                          {inv.amount > 0 ? (
                            <button
                              onClick={() => handleDownloadInvoice(inv.id)}
                              disabled={downloadingId === inv.id}
                              className="p-1.5 rounded-lg border border-slate-200/60 hover:bg-slate-50 hover:text-indigo-600 text-slate-400 transition-colors disabled:opacity-50 flex items-center justify-center"
                              title="Download PDF"
                            >
                              {downloadingId === inv.id ? (
                                <div className="w-3.5 h-3.5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                              ) : (
                                <HiOutlineDownload className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            <span className="text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-400 border border-slate-200/50">
                              N/A
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* APP PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <div className="glass-card p-6 bg-white border border-slate-200 shadow-sm rounded-3xl space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Dashboard & Scanning Preferences</h3>
                <p className="text-xs text-slate-400 mt-0.5">Tailor the OCR engine settings and system notifications to your workflow</p>
              </div>

              <div className="space-y-6">
                {/* OCR Quality Selector */}
                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">OCR Engine Mode</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handlePreferenceChange('scanAccuracy', 'high')}
                      className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-200 ${
                        preferences.scanAccuracy === 'high'
                          ? 'border-indigo-600 bg-indigo-50/20 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800">Precision Processing</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Deeper AI models, higher SKU extraction fidelity, handles poor lighting</span>
                    </button>
                    <button
                      onClick={() => handlePreferenceChange('scanAccuracy', 'fast')}
                      className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-200 ${
                        preferences.scanAccuracy === 'fast'
                          ? 'border-indigo-600 bg-indigo-50/20 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800">Speed Optimized</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Faster analysis, standard text matching, suitable for high volumes of clean PDFs</span>
                    </button>
                  </div>
                </div>

                {/* Default Export File Format */}
                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Default Export Format</label>
                  <div className="flex gap-2">
                    {['csv', 'excel', 'json'].map((format) => (
                      <button
                        key={format}
                        onClick={() => handlePreferenceChange('defaultExport', format)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                          preferences.defaultExport === format
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {format.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Notification Toggles */}
                <div className="space-y-4">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <HiOutlineBell className="w-4 h-4 text-indigo-500" /> Notification settings
                  </label>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Email on batch processing complete</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Receive structured extraction summaries when multiple files finish parsing</p>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange('emailOnComplete', !preferences.emailOnComplete)}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                          preferences.emailOnComplete ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            preferences.emailOnComplete ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Weekly analytics report digest</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Get a weekly email containing channel performance charts and return claim rates</p>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange('weeklyReport', !preferences.weeklyReport)}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                          preferences.weeklyReport ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            preferences.weeklyReport ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
