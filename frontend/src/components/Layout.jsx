import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HiOutlineViewGrid },
    { name: 'Upload Bill', path: '/', icon: HiOutlineCloudUpload },
    { name: 'Bill History', path: '/history', icon: HiOutlineDocumentText },
    { name: 'Analytics', path: '/analytics', icon: HiOutlineChartBar },
    { name: 'Subscription', path: '/subscription', icon: HiOutlineCreditCard },
    { name: 'Support', path: '/support', icon: HiOutlineQuestionMarkCircle },
    { name: 'Profile', path: '/profile', icon: HiOutlineUser },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-100 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/10">
          <HiOutlineDocumentSearch className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">BillScan Pro</h1>
          <p className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider -mt-0.5">SaaS Dashboard</p>
        </div>
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
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-600/5'
                  : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
                }`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section / Logout */}
      {user && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <NavLink
            to="/profile"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-2 py-2 mb-3 rounded-xl transition-all duration-200 hover:bg-indigo-50/50 group ${
                isActive ? 'bg-indigo-50 shadow-sm shadow-indigo-600/5' : ''
              }`
            }
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 shrink-0 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800 truncate leading-snug group-hover:text-indigo-600 transition-colors">
                {user.name}
              </p>
              <p className="text-xs text-slate-400 truncate leading-none mt-0.5 group-hover:text-indigo-500/80 transition-colors">
                {user.email}
              </p>
            </div>
          </NavLink>
          <button
            onClick={handleLogout}
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
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <HiOutlineDocumentSearch className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight text-base">BillScan Pro</span>
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
            BillScan Pro &mdash; Premium OCR SaaS Dashboard &bull; No AI/LLM
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
