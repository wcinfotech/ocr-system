import { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoutModal from './LogoutModal';
import {
  HiOutlineCloudUpload,
  HiOutlineViewGrid,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineUser,
  HiOutlineDocumentSearch,
  HiOutlineCreditCard,
  HiOutlineQuestionMarkCircle,
} from 'react-icons/hi';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setMobileOpen(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/app/dashboard', icon: HiOutlineViewGrid },
    { name: 'Upload Bill', path: '/app/upload', icon: HiOutlineCloudUpload },
    { name: 'Bill History', path: '/app/history', icon: HiOutlineDocumentText },
    { name: 'Analytics', path: '/app/analytics', icon: HiOutlineChartBar },
    { name: 'Subscription', path: '/app/subscription', icon: HiOutlineCreditCard },
    { name: 'Support', path: '/app/support', icon: HiOutlineQuestionMarkCircle },
    { name: 'Profile', path: '/app/profile', icon: HiOutlineUser },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-100 shrink-0">
        <Link to="/app/dashboard" className="flex items-center justify-start">
          <img src="/logo.png" alt="Escannora Logo" className="h-[58px] object-contain" />
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Exact match for '/' to avoid marking dashboard as active when at root
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                  ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-600/5'
                  : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
                }`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section / Logout */}
      {user && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <NavLink
            to="/app/profile"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-2 py-2 mb-3 rounded-xl transition-all duration-200 hover:bg-blue-50/50 group ${
                isActive ? 'bg-blue-50 shadow-sm shadow-blue-600/5' : ''
              }`
            }
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 shrink-0 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800 truncate leading-snug group-hover:text-blue-600 transition-colors">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-slate-400 truncate leading-normal pb-0.5 group-hover:text-blue-500/80 transition-colors">
                {user?.email}
              </p>
            </div>
          </NavLink>
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <HiOutlineLogout className="w-5 h-5 text-red-500" />
            Logout
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 fixed inset-y-0 left-0 z-20 shrink-0">
        <SidebarContent />
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Link to="/app/dashboard" className="flex items-center">
              <img src="/logo.png" alt="Escannora Logo" className="h-[52px] object-contain" />
            </Link>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            {mobileOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Drawer Backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile Sidebar Drawer */}
        <aside
          className={`fixed inset-y-0 left-0 w-64 z-50 transform lg:hidden transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <SidebarContent />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-full w-full mx-auto animate-fadeIn">
          {children}
        </main>

        {/* Footer */}
        <footer className="py-6 border-t border-slate-200/60 bg-white/50 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Escannora &mdash; Premium OCR SaaS Dashboard
          </p>
        </footer>
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
};

export default Layout;
