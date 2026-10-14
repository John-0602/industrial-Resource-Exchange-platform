import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BookOpen, LogIn, AlertCircle, Sparkles, UserCheck } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      await login(email, password);
      success('Welcome back! You have logged in successfully.');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setErrorMessage(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setErrorMessage('');
    setLoading(true);

    try {
      await login(demoEmail, 'Password@123');
      success(`Logged in as demo student (${demoEmail})`);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Demo login failed.';
      setErrorMessage(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-navy-900 text-teal-400 mx-auto flex items-center justify-center shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Student Sign In</h1>
          <p className="text-xs text-slate-500">
            Sign in to access your campus resource exchange account
          </p>
        </div>

        {/* Demo Accounts Panel */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Fast Evaluator Demo Accounts (1-Click Fill)</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              type="button"
              onClick={() => handleDemoLogin('priya.sharma@apex.edu')}
              className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-teal-500 text-xs text-slate-700 hover:bg-teal-50/50 transition-colors text-left"
            >
              <div>
                <p className="font-semibold text-slate-800">Priya Sharma</p>
                <p className="text-[11px] text-slate-400">Computer Science • priya.sharma@apex.edu</p>
              </div>
              <UserCheck className="w-4 h-4 text-teal-600" />
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('rahul.verma@apex.edu')}
              className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-teal-500 text-xs text-slate-700 hover:bg-teal-50/50 transition-colors text-left"
            >
              <div>
                <p className="font-semibold text-slate-800">Rahul Verma</p>
                <p className="text-[11px] text-slate-400">Electronics • rahul.verma@apex.edu</p>
              </div>
              <UserCheck className="w-4 h-4 text-teal-600" />
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('ananya.iyer@apex.edu')}
              className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-teal-500 text-xs text-slate-700 hover:bg-teal-50/50 transition-colors text-left"
            >
              <div>
                <p className="font-semibold text-slate-800">Ananya Iyer</p>
                <p className="text-[11px] text-slate-400">Mechanical • ananya.iyer@apex.edu</p>
              </div>
              <UserCheck className="w-4 h-4 text-teal-600" />
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              College Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student.name@apex.edu"
              className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-navy-900 text-white text-sm font-semibold hover:bg-navy-950 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-teal-700 hover:text-teal-800">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};
