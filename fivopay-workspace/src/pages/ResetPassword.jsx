import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, AlertCircle, Rocket, ChevronRight, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    
    const result = await resetPassword(email, newPassword);
    if (result.success) {
      setSuccess('Password reset successfully. You can now login.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[28px] bg-gradient-to-br from-accent-indigo to-accent-purple mb-6 shadow-xl shadow-indigo-100">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">Reset Password</h1>
          <p className="text-slate-400 font-bold text-lg">Enter your email and new password.</p>
        </div>

        <div className="bg-white rounded-[48px] shadow-premium p-12 border border-slate-50 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent-indigo to-accent-purple" />
          
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 px-6 py-4 rounded-2xl flex items-center gap-4 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-6 py-4 rounded-2xl flex items-center gap-4 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5" />
                {success}
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 ml-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-accent-indigo transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-3xl focus:outline-none focus:ring-8 focus:ring-accent-indigo/5 transition-all font-bold text-slate-700 placeholder-slate-300 shadow-inner"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 ml-2">New Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-accent-indigo transition-colors" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-3xl focus:outline-none focus:ring-8 focus:ring-accent-indigo/5 transition-all font-bold text-slate-700 placeholder-slate-300 shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.3em] rounded-[28px] hover:bg-slate-800 shadow-2xl shadow-slate-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-70 group/btn"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Reset Password
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center border-t border-slate-50 pt-8 relative z-10">
            <p className="text-slate-400 text-sm font-bold">
              Remember your password?{' '}
              <Link to="/login" className="text-accent-indigo font-black hover:underline ml-1">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
