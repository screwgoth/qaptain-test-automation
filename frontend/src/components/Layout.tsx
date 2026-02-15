/**
 * Main Layout Component
 * Navigation and page structure
 */

import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen">
      {/* Navigation - Glassmorphism */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 shadow-elevation-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200 inline-block">🧪</span>
                  <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div>
                  <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                    Qaptain
                  </span>
                  <div className="text-[10px] text-slate-500 font-medium tracking-wider uppercase -mt-1">
                    Test Automation
                  </div>
                </div>
              </Link>

              {/* Navigation Links */}
              <div className="hidden sm:flex sm:gap-2">
                <Link
                  to="/"
                  className={`
                    px-4 py-2 rounded-xl flex items-center gap-2 
                    font-medium text-sm transition-all duration-200
                    ${
                      isActive('/') && location.pathname === '/'
                        ? 'bg-gradient-to-r from-primary-600/20 to-primary-500/10 text-primary-400 border border-primary-500/30 shadow-primary-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                    }
                  `}
                >
                  📊 Dashboard
                </Link>
                <Link
                  to="/apps"
                  className={`
                    px-4 py-2 rounded-xl flex items-center gap-2 
                    font-medium text-sm transition-all duration-200
                    ${
                      isActive('/apps')
                        ? 'bg-gradient-to-r from-primary-600/20 to-primary-500/10 text-primary-400 border border-primary-500/30 shadow-primary-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                    }
                  `}
                >
                  📱 Apps
                </Link>
                <Link
                  to="/recorder"
                  className={`
                    px-4 py-2 rounded-xl flex items-center gap-2 
                    font-medium text-sm transition-all duration-200
                    ${
                      isActive('/recorder')
                        ? 'bg-gradient-to-r from-red-600/20 to-red-500/10 text-red-400 border border-red-500/30 shadow-red-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                    }
                  `}
                >
                  🎬 Recorder
                </Link>
              </div>
            </div>

            {/* User menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm text-slate-300 font-medium">
                    {user?.name || user?.email}
                  </div>
                  {user?.role === 'ADMIN' && (
                    <div className="text-xs text-primary-400 font-medium">Admin</div>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 
                         hover:bg-slate-800/50 rounded-xl transition-all duration-200
                         border border-transparent hover:border-slate-700/50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-slate-500 text-sm">
            <p>Built with Playwright • Powered by automation</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
