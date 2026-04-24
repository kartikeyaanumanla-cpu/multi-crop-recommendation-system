import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3002/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      login(data.user, data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-[#f8fcf9] to-teal-100/40 p-6 md:p-12 relative overflow-hidden flex items-center justify-center font-sans">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[40rem] h-[40rem] bg-emerald-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[30rem] h-[30rem] bg-teal-400/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-[32px] shadow-2xl shadow-emerald-900/5 border border-white/60 text-center">
          
          <div className="inline-flex items-center justify-center p-4 bg-white/70 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-emerald-100/50 mb-6">
            <Sprout className="w-10 h-10 text-emerald-600" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-emerald-950 tracking-tight mb-2 drop-shadow-sm">Welcome Back</h1>
          <p className="text-emerald-800/70 font-medium mb-8">Sign in to access your farm strategies</p>

          <form onSubmit={handleLogin} className="space-y-5 text-left">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-100 text-sm flex items-start gap-3 shadow-sm"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="opacity-90">{error}</p>
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-bold text-emerald-800/60 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/50 border border-emerald-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl py-3.5 pl-12 pr-4 text-emerald-950 font-medium transition-all outline-none shadow-inner"
                  placeholder="farmer@agri.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-800/60 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600/50" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/50 border border-emerald-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl py-3.5 pl-12 pr-4 text-emerald-950 font-medium transition-all outline-none shadow-inner"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group w-full max-w-sm mx-auto flex flex-col items-center justify-center p-1 rounded-[2rem] bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all duration-300 disabled:opacity-75 mt-8"
            >
              <div className="w-full rounded-full border border-white/20 py-3 px-8 flex items-center justify-center gap-3 relative overflow-hidden">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-bold tracking-wide">Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold tracking-wide">Sign In</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:animate-shimmer" />
              </div>
            </button>
          </form>

          <p className="mt-8 text-sm text-emerald-800/60 font-medium">
            Don't have an account? <Link to="/signup" className="text-emerald-600 font-bold hover:underline decoration-emerald-600/30 underline-offset-4">Create one</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
