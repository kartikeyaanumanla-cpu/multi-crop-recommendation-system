import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Strategy, RecommendationRequest } from '../types';
import { motion } from 'motion/react';
import { ArrowLeft, Droplets, TrendingUp, ShieldAlert, Scale, CheckCircle2, ChevronRight, Leaf } from 'lucide-react';

export const StrategyComparisonPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { strategies, request } = (location.state as { strategies: Strategy[], request: RecommendationRequest }) || { strategies: [], request: null };

  if (!strategies || strategies.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-screen bg-slate-50">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 max-w-md">
          <ShieldAlert className="w-16 h-16 text-amber-500 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-800 mb-3">No Plans Found</h2>
          <p className="text-slate-500 mb-8">We couldn't find any farming plans. Please go back and select a crop first.</p>
          <button
            onClick={() => navigate('/dashboard/plan')}
            className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> Return to Start
          </button>
        </div>
      </div>
    );
  }

  const handleSelect = (strategy: Strategy) => {
    navigate(`/dashboard/farm-view/${strategy.id}`, { state: { strategy, request } });
  };

  // Compute winning logic for each row
  const bestProfit = Math.max(...strategies.map(s => s.estimatedProfit));
  const bestWater = Math.max(...strategies.map(s => s.waterUsageScore));
  const riskOrder: Record<string, number> = { 'Low': 3, 'Medium': 2, 'High': 1 };
  const bestRiskVal = Math.max(...strategies.map(s => riskOrder[s.riskLevel] || 0));
  const bestYield = Math.max(...strategies.map(s => s.predictedYield?.[s.mainCrop] || 0));

  return (
    <div className="flex-1 min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <button onClick={() => navigate('/dashboard/plan')} className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-2 mb-8 transition-colors bg-white px-5 py-2 rounded-xl border border-slate-200 shadow-sm text-sm">
              <ArrowLeft className="w-4 h-4" /> Start Over
            </button>
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                <Scale className="w-6 h-6" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800">
                Strategy Comparison
              </h1>
            </div>
            <p className="text-slate-500 max-w-xl leading-relaxed text-base mt-2">
              Compare trade-offs across recommended farming strategies side-by-side. The most optimal metric in each row is highlighted in green.
            </p>
          </motion.div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-6 bg-slate-50 border-b border-r border-slate-200 w-1/4 font-bold text-slate-500 text-sm uppercase tracking-wider">
                    Metrics / Trade-offs
                  </th>
                  {strategies.map((strategy) => (
                    <th key={strategy.id} className="p-6 bg-slate-50 border-b border-slate-200 min-w-[250px]">
                      <div className="text-xl font-bold text-slate-800 mb-2">{strategy.name}</div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-1 bg-white text-slate-700 rounded text-xs font-semibold border border-slate-200">
                          {strategy.mainCrop}
                        </span>
                        {strategy.sideCrops.map(c => (
                          <span key={c} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold border border-emerald-100">
                            + {c}
                          </span>
                        ))}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Net Profit Row */}
                <tr>
                  <td className="p-6 border-b border-r border-slate-100 font-semibold text-slate-700 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" /> Net Profit
                  </td>
                  {strategies.map((strategy) => {
                    const isWinner = strategy.estimatedProfit === bestProfit;
                    return (
                      <td key={strategy.id} className={`p-6 border-b border-slate-100 font-medium ${isWinner ? 'bg-emerald-50/50' : ''}`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-lg ${isWinner ? 'text-emerald-700 font-bold' : 'text-slate-800'}`}>
                            ₹{strategy.estimatedProfit.toLocaleString()}
                          </span>
                          {isWinner && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Water Efficiency Row */}
                <tr>
                  <td className="p-6 border-b border-r border-slate-100 font-semibold text-slate-700 flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-500" /> Water Efficiency
                  </td>
                  {strategies.map((strategy) => {
                    const isWinner = strategy.waterUsageScore === bestWater;
                    return (
                      <td key={strategy.id} className={`p-6 border-b border-slate-100 font-medium ${isWinner ? 'bg-emerald-50/50' : ''}`}>
                         <div className="flex items-center justify-between">
                          <span className={`text-lg ${isWinner ? 'text-emerald-700 font-bold' : 'text-slate-800'}`}>
                            {strategy.waterUsageScore}<span className="text-sm text-slate-500 font-normal">/100</span>
                          </span>
                          {isWinner && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Risk Level Row */}
                <tr>
                  <td className="p-6 border-b border-r border-slate-100 font-semibold text-slate-700 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-500" /> Risk Level
                  </td>
                  {strategies.map((strategy) => {
                    const isWinner = (riskOrder[strategy.riskLevel] || 0) === bestRiskVal;
                    return (
                      <td key={strategy.id} className={`p-6 border-b border-slate-100 font-medium ${isWinner ? 'bg-emerald-50/50' : ''}`}>
                         <div className="flex items-center justify-between">
                          <span className={`text-lg ${isWinner ? 'text-emerald-700 font-bold' : 'text-slate-800'}`}>
                            {strategy.riskLevel}
                          </span>
                          {isWinner && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Main Crop Yield Row */}
                <tr>
                  <td className="p-6 border-b border-r border-slate-100 font-semibold text-slate-700 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-500" /> Main Crop Yield
                  </td>
                  {strategies.map((strategy) => {
                    const yieldVal = strategy.predictedYield?.[strategy.mainCrop] || 0;
                    const isWinner = yieldVal === bestYield && bestYield > 0;
                    return (
                      <td key={strategy.id} className={`p-6 border-b border-slate-100 font-medium ${isWinner ? 'bg-emerald-50/50' : ''}`}>
                         <div className="flex items-center justify-between">
                          <span className={`text-lg ${isWinner ? 'text-emerald-700 font-bold' : 'text-slate-800'}`}>
                            {yieldVal.toLocaleString()} kg
                          </span>
                          {isWinner && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Action Row */}
                <tr>
                  <td className="p-6 border-r border-slate-100 bg-slate-50"></td>
                  {strategies.map((strategy) => (
                    <td key={strategy.id} className="p-6 bg-slate-50">
                      <button
                        onClick={() => handleSelect(strategy)}
                        className="w-full py-3 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 group"
                      >
                        View Detailed Plan <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
