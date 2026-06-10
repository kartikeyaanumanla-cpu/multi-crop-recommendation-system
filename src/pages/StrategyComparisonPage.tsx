import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Strategy, RecommendationRequest } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Droplets, TrendingUp, ShieldAlert, Award, Grid, ChevronRight, Layers, Hexagon } from 'lucide-react';

export const StrategyComparisonPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { strategies, request } = (location.state as { strategies: Strategy[], request: RecommendationRequest }) || { strategies: [], request: null };

  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!strategies || strategies.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-widest">DATA NOT FOUND</h2>
        <p className="text-zinc-400 mb-6 font-mono text-sm">Please return to the input matrix.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-zinc-900 border border-white/10 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors uppercase tracking-widest text-xs flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Return
        </button>
      </div>
    );
  }

  const handleSelect = (strategy: Strategy) => {
    setSelectedId(strategy.id);
    navigate(`/farm-view/${strategy.id}`, { state: { strategy, request } });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'High': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30';
    }
  };

  return (
    <div className="flex-1 p-6 md:p-12 font-sans relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <button onClick={() => navigate('/')} className="text-zinc-400 hover:text-white font-bold flex items-center gap-2 mb-8 transition-colors bg-zinc-900/50 backdrop-blur-md px-5 py-2 rounded-xl border border-white/10 text-xs uppercase tracking-widest">
              <ArrowLeft className="w-4 h-4" /> RESTART SIMULATION
            </button>
            <div className="inline-flex items-center gap-3 mb-2">
              <Hexagon className="w-6 h-6 text-emerald-400" />
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm uppercase">
                STRATEGY<span className="text-emerald-500 font-light">/COMPARISON</span>
              </h1>
            </div>
            <p className="text-zinc-400 max-w-xl leading-relaxed text-sm font-mono mt-2">
              Review and compare the generated multi-crop architectures for your {request.acres} acre farm.
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {strategies.map((strategy, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4, ease: "easeOut" }}
              key={strategy.id}
              className="bg-zinc-900/40 backdrop-blur-2xl rounded-[2rem] p-8 shadow-2xl border border-white/10 hover:border-emerald-500/50 hover:bg-zinc-900/60 transition-all relative overflow-hidden group cursor-pointer"
              onClick={() => handleSelect(strategy)}
            >
              {/* Subtle grid pattern background */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                 <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl w-10 h-10 flex items-center justify-center">
                    <ChevronRight className="w-5 h-5" />
                 </div>
              </div>

              <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative z-10">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4 tracking-wide">{strategy.name}</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-zinc-950 text-zinc-300 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/5">
                      {strategy.mainCrop}
                    </span>
                    {strategy?.farmLayout && (
                      <span className="px-3 py-1 bg-indigo-950/50 text-indigo-400 rounded-lg text-[10px] font-bold border border-indigo-500/30 flex items-center gap-1.5 uppercase tracking-widest">
                        <Layers className="w-3 h-3" />
                        {strategy.farmLayout.layoutType}
                      </span>
                    )}
                    {strategy.sideCrops.map(c => (
                       <span key={c} className="px-3 py-1 bg-zinc-900/50 text-zinc-500 rounded-lg text-[10px] font-bold border border-white/5 uppercase tracking-widest">
                         + {c}
                       </span>
                    ))}
                  </div>
                </div>
                <div className="text-center sm:text-right flex flex-col items-center sm:items-end">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-16 h-16 transform -rotate-90 drop-shadow-md">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                      <circle cx="32" cy="32" r="28" fill="none" stroke="#10b981" strokeWidth="6" strokeDasharray="175" strokeDashoffset={175 - (175 * strategy.overallScore) / 100} className="transition-all duration-1000" />
                    </svg>
                    <span className="absolute text-lg font-bold text-white font-mono">{strategy.overallScore}</span>
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold mt-2">EFFICIENCY RATING</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                <div className="bg-zinc-950/50 rounded-xl p-4 border border-blue-500/20 shadow-inner">
                  <div className="flex items-center gap-2 mb-2 text-blue-400">
                    <Droplets className="w-4 h-4" />
                    <span className="text-[9px] uppercase tracking-[0.15em] font-bold">WATER OPTIMIZATION</span>
                  </div>
                  <div className="text-xl font-black text-white font-mono">{strategy.waterUsageScore}<span className="text-zinc-500 text-sm">/100</span></div>
                </div>
                
                <div className="bg-zinc-950/50 rounded-xl p-4 border border-emerald-500/20 shadow-inner">
                  <div className="flex items-center gap-2 mb-2 text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-[9px] uppercase tracking-[0.15em] font-bold">PROFIT PROJECTION</span>
                  </div>
                  <div className="text-xl font-black text-emerald-400 font-mono">₹{strategy.estimatedProfit.toLocaleString()}</div>
                </div>
              </div>

              {/* Simple Farm Layout Visualization */}
              <div className="relative z-10 bg-zinc-950/30 p-5 rounded-2xl border border-white/5">
                <h3 className="text-[10px] uppercase tracking-[0.15em] font-bold text-zinc-400 mb-4 flex items-center gap-2">
                  <Grid className="w-4 h-4 text-zinc-500" /> SPATIAL ALLOCATION ({request.acres} AC)
                </h3>
                <div className="h-4 w-full rounded-md flex overflow-hidden bg-zinc-900 border border-white/10 gap-[1px]">
                  {Object.entries(strategy.landDistribution).map(([crop, area], i) => {
                    const percentage = (area / request.acres) * 100;
                    const colors = ['bg-emerald-500', 'bg-indigo-500', 'bg-teal-500', 'bg-blue-500'];
                    return (
                      <div 
                        key={crop} 
                        style={{ width: `${percentage}%` }} 
                        className={`${colors[i % colors.length]} relative group opacity-80 hover:opacity-100 transition-opacity`}
                      >
                         {/* Tooltip on hover */}
                         <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-zinc-800 text-white text-xs px-2 py-1 rounded shadow-lg z-20 border border-white/10 font-mono">
                           {crop}: {area} ac
                         </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  {Object.entries(strategy.landDistribution).map(([crop, area], i) => {
                    const colors = ['bg-emerald-500', 'bg-indigo-500', 'bg-teal-500', 'bg-blue-500'];
                    return (
                       <div key={crop} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                         <div className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`}></div>
                         {crop} <span className="text-zinc-600">({area} AC)</span>
                       </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-emerald-400 font-bold text-xs tracking-[0.15em] uppercase group-hover:text-emerald-300 transition-colors relative z-10">
                 VIEW DETAILED FARM BLUEPRINT
                 <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
