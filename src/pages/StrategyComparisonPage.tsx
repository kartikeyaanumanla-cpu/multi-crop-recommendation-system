import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Strategy, RecommendationRequest } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Droplets, TrendingUp, ShieldAlert, Award, Grid, ChevronRight, Layers } from 'lucide-react';

export const StrategyComparisonPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { strategies, request } = (location.state as { strategies: Strategy[], request: RecommendationRequest }) || { strategies: [], request: null };

  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!strategies || strategies.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No strategies found. Please go back and generate them.</p>
          <button onClick={() => navigate('/')} className="text-emerald-600 font-medium flex items-center gap-2 mx-auto">
            <ArrowLeft className="w-4 h-4" /> Back to Input
          </button>
        </div>
      </div>
    );
  }

  const handleSelect = (strategy: Strategy) => {
    setSelectedId(strategy.id);
    navigate(`/farm-view/${strategy.id}`, { state: { strategy, request } });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-emerald-500 bg-emerald-50';
      case 'Medium': return 'text-amber-500 bg-amber-50';
      case 'High': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-[#f8fcf9] to-teal-100/40 text-gray-900 font-sans p-6 md:p-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 -ml-32 -mt-32 w-[40rem] h-[40rem] bg-emerald-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-[30rem] h-[30rem] bg-teal-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <button onClick={() => navigate('/')} className="text-emerald-700/70 hover:text-emerald-800 font-medium flex items-center gap-2 mb-6 transition-colors bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 shadow-sm hover:shadow-md">
              <ArrowLeft className="w-4 h-4" /> Start Over
            </button>
            <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-emerald-950 mb-3 drop-shadow-sm font-extrabold italic">
              Strategy Comparison
            </h1>
            <p className="text-emerald-800/80 max-w-xl leading-relaxed text-sm md:text-base font-medium">
              Review and compare the highly-optimized multi-crop strategies designed for your {request.acres} acre farm.
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
              className="bg-white/70 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl shadow-emerald-900/5 border border-white/60 hover:border-emerald-300 hover:bg-white/90 transition-all relative overflow-hidden group cursor-pointer"
              onClick={() => handleSelect(strategy)}
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 cursor-pointer">
                 <div className="bg-emerald-50 text-emerald-600 rounded-full w-10 h-10 flex items-center justify-center">
                    <ChevronRight className="w-5 h-5" />
                 </div>
              </div>

              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-800">{strategy.name}</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-semibold uppercase tracking-wider">
                      {strategy.mainCrop}
                    </span>
                    {strategy?.farmLayout && (
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium border border-blue-100 flex items-center gap-1.5 capitalize">
                        <Layers className="w-3.5 h-3.5" />
                        {strategy.farmLayout.layoutType}
                      </span>
                    )}
                    {strategy.sideCrops.map(c => (
                       <span key={c} className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-xs font-medium border border-gray-100">
                         + {c}
                       </span>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="#f3f4f6" strokeWidth="6" />
                      <circle cx="32" cy="32" r="28" fill="none" stroke="#10b981" strokeWidth="6" strokeDasharray="175" strokeDashoffset={175 - (175 * strategy.overallScore) / 100} className="transition-all duration-1000" />
                    </svg>
                    <span className="absolute text-lg font-bold text-gray-800">{strategy.overallScore}</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1">Overall</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-100/50 shadow-[inset_0_2px_4px_rgb(0,0,0,0.02)]">
                  <div className="flex items-center gap-2 mb-1 text-blue-600">
                    <Droplets className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Water Efficiency</span>
                  </div>
                  <div className="text-xl font-black text-blue-950">{strategy.waterUsageScore}/100</div>
                </div>
                
                <div className="bg-emerald-50/80 backdrop-blur-sm rounded-2xl p-4 border border-emerald-100/50 shadow-[inset_0_2px_4px_rgb(0,0,0,0.02)]">
                  <div className="flex items-center gap-2 mb-1 text-emerald-700">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Est. Profit</span>
                  </div>
                  <div className="text-xl font-black text-emerald-950">₹{strategy.estimatedProfit.toLocaleString()}</div>
                </div>
                
                <div className={`rounded-2xl p-4 border bg-opacity-80 backdrop-blur-sm shadow-[inset_0_2px_4px_rgb(0,0,0,0.02)] ${getRiskColor(strategy.riskLevel).replace('text-', 'border-').replace('bg-', 'bg-')}`}>
                  <div className={`flex items-center gap-2 mb-1 ${getRiskColor(strategy.riskLevel).split(' ')[0]}`}>
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Risk Level</span>
                  </div>
                  <div className="text-xl font-black text-gray-900">{strategy.riskLevel}</div>
                </div>
              </div>

              {/* Simple Farm Layout Visualization */}
              <div>
                <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-3 flex items-center gap-2">
                  <Grid className="w-4 h-4" /> Land Allocation ({request.acres} Acres)
                </h3>
                <div className="h-6 w-full rounded-full flex overflow-hidden bg-gray-100 shadow-inner gap-[2px]">
                  {Object.entries(strategy.landDistribution).map(([crop, area], i) => {
                    const percentage = (area / request.acres) * 100;
                    const colors = ['bg-emerald-500', 'bg-emerald-400', 'bg-emerald-300', 'bg-emerald-200'];
                    return (
                      <div 
                        key={crop} 
                        style={{ width: `${percentage}%` }} 
                        className={`${colors[i % colors.length]} relative group flex items-center justify-center`}
                      >
                         {percentage > 15 && <span className="text-[10px] font-bold text-white tracking-widest">{Math.round(percentage)}%</span>}
                         {/* Tooltip on hover */}
                         <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg z-10">
                           {crop}: {area} acres
                         </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-4 mt-3">
                  {Object.entries(strategy.landDistribution).map(([crop, area], i) => {
                    const colors = ['bg-emerald-500', 'bg-emerald-400', 'bg-emerald-300', 'bg-emerald-200'];
                    return (
                       <div key={crop} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                         <div className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`}></div>
                         {crop} <span className="text-gray-400">({area} ac)</span>
                       </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-emerald-900/10 flex items-center gap-2 text-emerald-600 font-bold text-sm tracking-wide group-hover:underline decoration-emerald-600/30 underline-offset-4">
                 View Detailed Interactive Analysis
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
