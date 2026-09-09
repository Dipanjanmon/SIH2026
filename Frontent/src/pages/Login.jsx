import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { LogIn, User, Lock, Shield, Stethoscope, Tractor, ArrowLeft, Loader2 } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Redirect to dashboard on successful login
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else if (role === 'farmer') {
      setUsername('farmer1');
      setPassword('farmer123');
    } else if (role === 'vet') {
      setUsername('vet1');
      setPassword('vet123');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative">
        <Link 
          to="/" 
          className={`absolute -left-16 top-1/2 -translate-y-1/2 p-2 rounded-full ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-200'} transition-colors hidden md:block`}
          title="Back to Home"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex justify-center">
          <div className={`p-3 rounded-2xl ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
            <LogIn className="w-10 h-10" />
          </div>
        </div>
        <h2 className={`mt-6 text-center text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Welcome to PashuSahaya
        </h2>
        <p className={`mt-2 text-center text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Sign in to access your dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`py-8 px-4 shadow sm:rounded-xl sm:px-10 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          
          <div className="mb-6">
            <p className={`text-sm font-medium mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Quick Demo Login
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => fillDemo('admin')}
                type="button"
                className={`flex flex-col items-center p-2 rounded-lg border transition-colors ${darkMode ? 'border-slate-700 hover:border-blue-500 hover:bg-slate-700/50 text-slate-300' : 'border-slate-200 hover:border-blue-500 hover:bg-slate-50 text-slate-700'}`}
              >
                <Shield className="w-5 h-5 mb-1 text-red-500" />
                <span className="text-xs">Admin</span>
              </button>
              <button
                onClick={() => fillDemo('farmer')}
                type="button"
                className={`flex flex-col items-center p-2 rounded-lg border transition-colors ${darkMode ? 'border-slate-700 hover:border-blue-500 hover:bg-slate-700/50 text-slate-300' : 'border-slate-200 hover:border-blue-500 hover:bg-slate-50 text-slate-700'}`}
              >
                <Tractor className="w-5 h-5 mb-1 text-green-500" />
                <span className="text-xs">Farmer</span>
              </button>
              <button
                onClick={() => fillDemo('vet')}
                type="button"
                className={`flex flex-col items-center p-2 rounded-lg border transition-colors ${darkMode ? 'border-slate-700 hover:border-blue-500 hover:bg-slate-700/50 text-slate-300' : 'border-slate-200 hover:border-blue-500 hover:bg-slate-50 text-slate-700'}`}
              >
                <Stethoscope className="w-5 h-5 mb-1 text-blue-500" />
                <span className="text-xs">Vet</span>
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-500'}`}>
                Or sign in with credentials
              </span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-100/10 border border-red-500/20 rounded-lg text-center">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Username
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className={`h-5 w-5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`block w-full pl-10 sm:text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors border ${
                    darkMode 
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-10 sm:text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors border ${
                    darkMode 
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-colors"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 flex items-center justify-center gap-2">
             <ArrowLeft className="w-4 h-4 text-slate-400" />
             <Link to="/" className={`text-sm font-medium ${darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-600 hover:text-slate-900'}`}>
                Back to Home
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
