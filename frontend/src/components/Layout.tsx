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
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200 inline-block">🧪</span>
                </div>
                <div>
                  <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                    Qaptain
                  </span>
                  <div className="text-[10px] text-gray-500 font-medium tracking-wider uppercase -mt-1">
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
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
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
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
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
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                    }
                  `}
                >
                  🎬 Recorder
                </Link>
              </div>
            </div>

            {/* User menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm text-gray-900 font-medium">
                    {user?.name || user?.email}
                  </div>
                  {user?.role === 'ADMIN' && (
                    <div className="text-xs text-primary-600 font-medium">Admin</div>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 
                         hover:bg-gray-50 rounded-xl transition-all duration-200
                         border border-transparent hover:border-gray-200"
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
      <footer className="mt-16 border-t border-gray-200 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            <p>Built with Playwright • Powered by automation</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
