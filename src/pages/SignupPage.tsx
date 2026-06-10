import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hexagon, Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3002/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
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
    <div className="flex-1 flex items-center justify-center p-6 w-full relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] relative"
      >
        {/* Glow behind card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 rounded-[2rem] blur-xl opacity-70" />
        
        <div className="bg-zinc-900/60 backdrop-blur-2xl p-8 md:p-10 rounded-[2rem] shadow-2xl border border-white/10 text-center relative overflow-hidden">
          
          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

          <div className="inline-flex items-center justify-center p-4 bg-zinc-800/50 backdrop-blur-md rounded-2xl border border-white/5 mb-6 relative group">
            <div className="absolute inset-0 bg-indigo-500/20 blur-md rounded-2xl group-hover:bg-indigo-500/30 transition-colors" />
            <Hexagon className="w-10 h-10 text-indigo-400 relative z-10" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">AGRI<span className="text-indigo-400">.</span>REGISTER</h1>
          <p className="text-zinc-400 font-medium mb-8 text-sm">Initialize a new farm profile</p>

          <form onSubmit={handleSignup} className="space-y-5 text-left relative z-10">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl border border-red-500/20 text-sm flex items-start gap-3 backdrop-blur-sm"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </motion.div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-2 ml-1">Identity Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-white/5 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-xl py-3.5 pl-12 pr-4 text-zinc-100 font-medium transition-all outline-none"
                  placeholder="Subject Name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-2 ml-1">Identity Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-white/5 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-xl py-3.5 pl-12 pr-4 text-zinc-100 font-medium transition-all outline-none"
                  placeholder="user@nexus.io"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-2 ml-1">Security Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-white/5 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-xl py-3.5 pl-12 pr-4 text-zinc-100 font-medium transition-all outline-none"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative group overflow-hidden rounded-xl mt-8 p-[1px]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-full bg-zinc-900 rounded-xl py-3.5 px-8 flex items-center justify-center gap-3 transition-all duration-300 group-hover:bg-zinc-900/50">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                    <span className="font-bold tracking-wide text-white">ALLOCATING...</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold tracking-widest text-sm text-white">CREATE NODE</span>
                    <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </>
                )}
              </div>
            </button>
          </form>

          <p className="mt-8 text-xs text-zinc-500 font-medium relative z-10">
            ALREADY ALLOCATED? <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors ml-1 uppercase tracking-wider">Initiate Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
