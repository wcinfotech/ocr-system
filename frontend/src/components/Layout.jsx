import { NavLink } from 'react-router-dom';
import { HiOutlineCloudUpload, HiOutlineViewGrid, HiOutlineDocumentSearch } from 'react-icons/hi';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card rounded-none border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                <HiOutlineDocumentSearch className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">BillScan Pro</h1>
                <p className="text-[10px] text-slate-500 -mt-1">OCR • Extract • Manage</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-indigo-500/15 text-indigo-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`
                }
              >
                <HiOutlineCloudUpload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
              </NavLink>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-indigo-500/15 text-indigo-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`
                }
              >
                <HiOutlineViewGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4">
        <p className="text-center text-xs text-slate-600">
          BillScan Pro &mdash; OCR-Powered Bill Scanner &bull; No AI/LLM
        </p>
      </footer>
    </div>
  );
};

export default Layout;
