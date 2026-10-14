import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Factory, LogIn, AlertCircle, Sparkles, Building2, ShieldAlert } from 'lucide-react';

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
      success('Corporate session authenticated successfully.');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials.';
      setErrorMessage(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword = 'Password@123') => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
    setLoading(true);

    try {
      await login(demoEmail, demoPassword);
      success(`Authenticated as demo enterprise: ${demoEmail}`);
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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-navy-900 text-teal-400 mx-auto flex items-center justify-center shadow-md">
            <Factory className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Industrial Enterprise Sign In</h1>
          <p className="text-xs text-slate-500">
            Sign in to manage industrial surplus inventories, procurement needs, and circular transfers
          </p>
        </div>

        {/* 1-Click Demo Accounts for Evaluators */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>1-Click Evaluator Demo Accounts</span>
            </div>
            <span className="text-[10px] bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded">
              Ready to Test
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoLogin('karthik@apextextiles.com')}
              className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 text-left transition-colors"
            >
              <div className="font-semibold text-slate-900 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Apex Textiles</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">Textile scraps & fibers (TN)</p>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('rajesh@kalyaniforge.com')}
              className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 text-left transition-colors"
            >
              <div className="font-semibold text-slate-900 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Kalyani Forge</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">Steel turning scrap (MH)</p>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('sneha@greenleafpolymers.com')}
              className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 text-left transition-colors"
            >
              <div className="font-semibold text-slate-900 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>GreenLeaf Polymers</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">HDPE/PP granules & flakes (GJ)</p>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('mahesh@sahyadriboards.com')}
              className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 text-left transition-colors"
            >
              <div className="font-semibold text-slate-900 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Sahyadri Eco-Board</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">Industrial sawdust & wood waste (KA)</p>
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleDemoLogin('admin@irep.gov.in', 'AdminPassword@123')}
            className="w-full p-2.5 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100/70 text-left transition-colors flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                <span>Platform Administrator (IREP Compliance)</span>
              </div>
              <p className="text-[11px] text-amber-800/80">Moderate listings and review company verification applications</p>
            </div>
            <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
              Admin Role
            </span>
          </button>
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
              Corporate Business Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="procurement@enterprise.com"
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
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-navy-900 text-white text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating Enterprise...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Enterprise Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500">
          New enterprise to the circular exchange?{' '}
          <Link to="/register" className="font-semibold text-teal-700 hover:text-teal-800">
            Register Industrial Entity
          </Link>
        </p>
      </div>
    </div>
  );
};
