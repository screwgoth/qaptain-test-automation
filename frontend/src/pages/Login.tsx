/**
 * Login Page
 */

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (type: 'admin' | 'demo') => {
    if (type === 'admin') {
      setEmail('admin@qaptain.app');
      setPassword('admin123');
    } else {
      setEmail('demo@qaptain.app');
      setPassword('demo123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-blue-50 to-purple-50">
      <div className="relative z-10 max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block relative">
            <span className="text-7xl drop-shadow-lg">🧪</span>
          </div>
          <h1 className="mt-4 text-5xl font-display font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
            Qaptain
          </h1>
          <p className="mt-2 text-gray-600 text-sm tracking-wide font-medium">
            PLAYWRIGHT TEST AUTOMATION PLATFORM
          </p>
        </div>

        {/* Login Card */}
        <div className="card-glass shadow-xl">
          <h2 className="text-2xl font-display font-semibold text-gray-900 mb-6">Sign In</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <span className="font-semibold">Error: </span>{error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="user@example.com"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="label">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              className="btn btn-primary w-full justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="spinner w-5 h-5"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <p className="text-center mt-6 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="link font-medium">
              Register
            </Link>
          </p>
          
          {/* Demo Credentials */}
          <div className="mt-6 p-5 bg-primary-50 rounded-xl border border-primary-200">
            <p className="text-sm font-semibold text-primary-700 mb-3 flex items-center gap-2">
              <span>🔑</span> Demo Credentials
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin')}
                className="w-full text-left p-3 hover:bg-primary-100 rounded-lg 
                         transition-colors bg-white border border-primary-200
                         hover:border-primary-300 group"
                disabled={isLoading}
              >
                <div className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">Admin Account</div>
                <div className="text-xs font-mono text-gray-600 mt-1">admin@qaptain.app / admin123</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('demo')}
                className="w-full text-left p-3 hover:bg-primary-100 rounded-lg 
                         transition-colors bg-white border border-primary-200
                         hover:border-primary-300 group"
                disabled={isLoading}
              >
                <div className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">Demo User</div>
                <div className="text-xs font-mono text-gray-600 mt-1">demo@qaptain.app / demo123</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-gray-600 text-sm">
          Built with Playwright • Powered by automation
        </p>
      </div>
    </div>
  );
}

export default Login;
