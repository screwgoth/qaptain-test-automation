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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-radial from-primary-950/50 via-slate-950 to-slate-950 opacity-80"></div>
      
      <div className="relative z-10 max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block relative">
            <span className="text-7xl">🧪</span>
            <div className="absolute inset-0 bg-primary-500/30 blur-3xl"></div>
          </div>
          <h1 className="mt-4 text-5xl font-display font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Qaptain
          </h1>
          <p className="mt-2 text-slate-400 text-sm tracking-wide">
            PLAYWRIGHT TEST AUTOMATION PLATFORM
          </p>
        </div>

        {/* Login Card */}
        <div className="card-glass animate-slide-up">
          <h2 className="text-2xl font-display font-semibold text-slate-100 mb-6">Sign In</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm backdrop-blur-sm">
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
          
          <p className="text-center mt-6 text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="link font-medium">
              Register
            </Link>
          </p>
          
          {/* Demo Credentials */}
          <div className="mt-6 p-5 bg-primary-500/5 rounded-xl border border-primary-500/20 backdrop-blur-sm">
            <p className="text-sm font-semibold text-primary-400 mb-3 flex items-center gap-2">
              <span>🔑</span> Demo Credentials
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin')}
                className="w-full text-left p-3 hover:bg-primary-500/10 rounded-lg 
                         transition-colors bg-slate-900/50 border border-slate-700/50
                         hover:border-primary-500/30 group"
                disabled={isLoading}
              >
                <div className="font-semibold text-slate-200 group-hover:text-primary-400 transition-colors">Admin Account</div>
                <div className="text-xs font-mono text-slate-500 mt-1">admin@qaptain.app / admin123</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('demo')}
                className="w-full text-left p-3 hover:bg-primary-500/10 rounded-lg 
                         transition-colors bg-slate-900/50 border border-slate-700/50
                         hover:border-primary-500/30 group"
                disabled={isLoading}
              >
                <div className="font-semibold text-slate-200 group-hover:text-primary-400 transition-colors">Demo User</div>
                <div className="text-xs font-mono text-slate-500 mt-1">demo@qaptain.app / demo123</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-slate-500 text-sm">
          Built with Playwright • Powered by automation
        </p>
      </div>
    </div>
  );
}

export default Login;
