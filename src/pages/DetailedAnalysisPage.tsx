import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Strategy, RecommendationRequest } from '../types';
import { motion } from 'motion/react';
import { ArrowLeft, Droplets, TrendingUp, ShieldAlert, Calendar, Sprout, Activity, Map, Layers } from 'lucide-react';

export const DetailedAnalysisPage: React.FC = () => {
  const { strategyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { strategy, request } = (location.state as { strategy: Strategy, request: RecommendationRequest }) || { strategy: null, request: null };

  if (!strategy || !request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Strategy details not found.</p>
          <button onClick={() => navigate('/compare')} className="text-emerald-600 font-medium flex items-center gap-2 mx-auto">
            <ArrowLeft className="w-4 h-4" /> Back to Comparisons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-[#f8fcf9] to-teal-100/30 text-gray-900 font-sans p-6 md:p-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[40rem] h-[40rem] bg-emerald-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[30rem] h-[30rem] bg-teal-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <button onClick={() => navigate(-1)} className="text-emerald-700/70 hover:text-emerald-800 font-medium flex items-center gap-2 mb-6 transition-colors bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 shadow-sm hover:shadow-md">
              <ArrowLeft className="w-4 h-4" /> Back to Strategies
            </button>
            <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-emerald-950 mb-2 drop-shadow-sm font-extrabold italic">
              {strategy.name}
            </h1>
            <p className="text-emerald-800/80 max-w-lg leading-relaxed text-sm md:text-base font-medium">
              Detailed breakdown of yields, water requirements, and cultivation timeline.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white/70 backdrop-blur-xl px-6 py-4 rounded-3xl shadow-xl shadow-emerald-900/5 border border-white/60 flex items-center gap-4"
          >
            <div className="text-center">
              <div className="text-sm text-gray-400 font-bold tracking-wider uppercase mb-1">Score</div>
              <div className="text-3xl font-bold text-emerald-600">{strategy.overallScore}</div>
            </div>
            <div className="w-px h-10 bg-gray-100 mx-2"></div>
            <div className="text-center">
              <div className="text-sm text-gray-400 font-bold tracking-wider uppercase mb-1">Profit</div>
              <div className="text-xl font-bold text-gray-800">₹{(strategy.estimatedProfit / 1000).toFixed(1)}k</div>
            </div>
            {strategy.marketPrice && (
              <>
                <div className="w-px h-10 bg-gray-100 mx-2"></div>
                <div className="text-center">
                  <div className="text-sm text-green-500 font-bold tracking-wider uppercase mb-1 flex items-center justify-center gap-1.5">
                    {strategy.mainCrop} Price
                    {strategy.marketPrice.isLive ? 
                        <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded-full"><span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span> LIVE</span> 
                        : 
                        <span className="inline-flex items-center gap-1 text-[9px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded-full">HISTORIC</span>
                    }
                  </div>
                  <div className="text-xl font-bold text-green-700">₹{strategy.marketPrice.pricePerKg.toFixed(2)}<span className="text-sm text-green-600/70 font-medium">/kg</span></div>
                </div>
              </>
            )}
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Breakdown */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 backdrop-blur-xl p-8 rounded-[32px] shadow-lg shadow-emerald-900/5 border border-white/60"
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-800">
                <Activity className="w-6 h-6 text-emerald-600" />
                Crop-wise Breakdown
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-4 text-xs tracking-wider text-gray-400 font-bold uppercase">Crop</th>
                      <th className="pb-4 text-xs tracking-wider text-gray-400 font-bold uppercase">Area (Acres)</th>
                      <th className="pb-4 text-xs tracking-wider text-gray-400 font-bold uppercase">Expected Yield</th>
                      <th className="pb-4 text-xs tracking-wider text-gray-400 font-bold uppercase">Water Reqd.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {Object.keys(strategy.landDistribution).map(crop => (
                      <tr key={crop} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 font-semibold text-gray-800 flex items-center gap-2">
                          <Sprout className="w-4 h-4 text-emerald-500" /> {crop}
                        </td>
                        <td className="py-4 text-gray-600">{strategy.landDistribution[crop]} ac</td>
                        <td className="py-4 text-emerald-600 font-bold">{strategy.predictedYield[crop]} kg</td>
                        <td className="py-4 text-blue-500 font-medium flex items-center gap-1.5">
                          <Droplets className="w-3.5 h-3.5" /> {strategy.waterRequirementPerCrop[crop]} mm
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {strategy.farmLayout && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-emerald-500 to-teal-700 p-8 rounded-[32px] shadow-lg text-white"
              >
                <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2 text-white flex items-center gap-3">
                      <Map className="w-6 h-6 text-emerald-100" />
                      Farm Layout & Sowing Pattern
                    </h2>
                    <p className="text-emerald-50 text-sm leading-relaxed mb-6 opacity-90 max-w-md">
                      Based on this strategy's generated land distribution, follow this physical allocation structure to maximize efficiency and crop health.
                    </p>
                    
                    <div className="flex items-center gap-3 mb-4 bg-white/10 w-max px-4 py-2 rounded-xl border border-white/20 backdrop-blur-sm">
                       <Layers className="w-5 h-5 text-emerald-200" />
                       <div className="capitalize font-medium text-emerald-50">{strategy.farmLayout.layoutType}</div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl md:max-w-[240px] shadow-md border border-gray-100 text-gray-800 self-stretch flex flex-col justify-center">
                    <h4 className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Recommended Pattern</h4>
                    <p className="text-sm font-medium leading-relaxed">{strategy.farmLayout.sowingPattern}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-xl p-8 rounded-[32px] shadow-lg shadow-emerald-900/5 border border-white/60"
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-800">
                <Calendar className="w-6 h-6 text-emerald-600" />
                Cultivation Timeline
              </h2>
              
              <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:left-[11px] before:-ml-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-100 before:to-transparent">
                {strategy.timeline.map((event, i) => (
                  <div key={i} className="relative">
                    <div className="absolute left-[-30px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">{event.month}</h3>
                    <p className="text-gray-700 leading-relaxed">{event.activity}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Risk & Resources */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-xl p-8 rounded-[32px] shadow-lg shadow-emerald-900/5 border border-white/60"
            >
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-3 text-gray-800">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                Risk Analysis
              </h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-gray-500 text-sm font-medium">Overall Risk Level</span>
                    <span className={`font-bold ${strategy.riskLevel === 'Low' ? 'text-emerald-500' : strategy.riskLevel === 'Medium' ? 'text-amber-500' : 'text-red-500'}`}>
                      {strategy.riskLevel}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${strategy.riskLevel === 'Low' ? 'bg-emerald-500 w-1/3' : strategy.riskLevel === 'Medium' ? 'bg-amber-500 w-2/3' : 'bg-red-500 w-full'}`}
                    />
                  </div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100/50">
                  <p className="text-sm text-amber-800/80 leading-relaxed text-justify">
                    Based on the requested {request.waterLevel.toLowerCase()} water availability and {request.soilType.toLowerCase()} soil, this strategy presents {strategy.riskLevel.toLowerCase()} risk. Regular monitoring during the mid-season is recommended.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-blue-50/50 backdrop-blur-md p-8 rounded-[32px] shadow-lg border border-blue-100/50"
            >
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-3 text-blue-800">
                <Droplets className="w-5 h-5 text-blue-500" />
                Water Usage Profile
              </h2>
              
              <div className="text-center mb-6">
                <div className="text-5xl font-serif text-blue-600 mb-2">{strategy.waterUsageScore}<span className="text-2xl text-blue-300">/100</span></div>
                <div className="text-xs uppercase tracking-wider font-bold text-blue-400">Efficiency Score</div>
              </div>
              
              <ul className="space-y-3">
                {Object.entries(strategy.waterRequirementPerCrop).map(([crop, req]) => (
                  <li key={crop} className="flex justify-between text-sm items-center">
                    <span className="text-blue-800/70 font-medium">{crop}</span>
                    <span className="text-blue-600 font-bold bg-blue-100 px-2 py-1 rounded-md">{req} mm</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
