import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Strategy, RecommendationRequest } from '../../types';
import { ArrowRight, Droplets, TrendingUp, ShieldAlert, Layers, Hexagon } from 'lucide-react';

// Color mapping matching crop zone ground colors
const CROP_COLORS: Record<string, string> = {
  rice: '#5B8C3E', wheat: '#C4A24E', maize: '#6B9B4E', cotton: '#7BA05B',
  sugarcane: '#4D8C3A', jute: '#6B8B4E', mustard: '#8B8B3E', lentil: '#8B7B4E',
  chickpea: '#9B8B5E', millet: '#7B7B3E', sorghum: '#6B7B4E', groundnut: '#8B7B4E',
  soybean: '#5B8B4E', potato: '#7B8B5E', tomato: '#E04030',
};

interface FarmHUDProps {
  strategy: Strategy;
  request: RecommendationRequest;
}

export const FarmHUD: FC<FarmHUDProps> = ({ strategy, request }) => {
  const navigate = useNavigate();

  const getRiskStyle = (risk: string) => {
    switch (risk) {
      case 'Low': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
      case 'Medium': return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' };
      case 'High': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' };
      default: return { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20' };
    }
  };

  const riskStyle = getRiskStyle(strategy.riskLevel);

  return (
    <div className="absolute top-0 right-0 bottom-0 w-[360px] flex flex-col bg-zinc-950/80 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-10 overflow-y-auto text-zinc-300 font-sans">
      
      {/* HUD Background Effects */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-zinc-900/50 relative z-10">
        <div className="flex items-center gap-2 mb-3 text-cyan-400">
          <Hexagon className="w-4 h-4" />
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold">BLUEPRINT ANALYTICAL HUD</span>
        </div>
        <h2 className="text-xl font-bold mb-1 text-white uppercase tracking-wider">{strategy.name}</h2>
        <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-[0.1em] opacity-80 font-mono">
          {request.acres} AC · {request.season} PHASE
        </p>
      </div>

      {/* Score Ring */}
      <div className="p-6 flex items-center gap-6 border-b border-white/5 relative z-10">
        <div className="relative inline-flex items-center justify-center flex-shrink-0">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="34" fill="none"
              stroke="#10b981" strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - strategy.overallScore / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <span className="absolute text-2xl font-black text-white font-mono">{strategy.overallScore}</span>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-bold mb-1">EFFICIENCY RATING</div>
          <div className="text-[10px] text-zinc-400 uppercase font-mono">Multi-variable projection</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 p-6 border-b border-white/5 relative z-10">
        <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
          <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-[8px] uppercase tracking-[0.15em] font-bold">PROFIT (EST)</span>
          </div>
          <div className="text-sm font-bold text-emerald-400 font-mono">₹{strategy.estimatedProfit.toLocaleString()}</div>
        </div>

        <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
          <div className="flex items-center gap-1.5 text-blue-400 mb-1">
            <Droplets className="w-3.5 h-3.5" />
            <span className="text-[8px] uppercase tracking-[0.15em] font-bold">HYDRO</span>
          </div>
          <div className="text-sm font-bold text-blue-400 font-mono">{strategy.waterUsageScore}/100</div>
        </div>

        <div className={`${riskStyle.bg} rounded-xl p-3 border ${riskStyle.border}`}>
          <div className={`flex items-center gap-1.5 ${riskStyle.text} mb-1`}>
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="text-[8px] uppercase tracking-[0.15em] font-bold">THREAT LVL</span>
          </div>
          <div className={`text-sm font-bold font-mono ${riskStyle.text} uppercase`}>{strategy.riskLevel}</div>
        </div>

        <div className="bg-indigo-500/10 rounded-xl p-3 border border-indigo-500/20">
          <div className="flex items-center gap-1.5 text-indigo-400 mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[8px] uppercase tracking-[0.15em] font-bold">STRUCT</span>
          </div>
          <div className="text-sm font-bold text-indigo-400 uppercase font-mono truncate">{strategy.farmLayout?.layoutType || 'MIXED'}</div>
        </div>
      </div>

      {/* Crop Legend */}
      <div className="p-6 border-b border-white/5 flex-1 relative z-10">
        <h3 className="text-[10px] uppercase tracking-[0.15em] font-bold text-zinc-500 mb-4">CROP ALLOCATION</h3>
        <div className="space-y-4">
          {Object.entries(strategy.landDistribution).map(([crop, areaVal]) => {
            const area = areaVal as number;
            const percentage = Math.round((area / request.acres) * 100);
            const color = CROP_COLORS[crop.toLowerCase()] || '#6B8B5E';
            return (
              <div key={crop} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0 border border-white/20"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-bold text-xs text-zinc-300 uppercase tracking-wider">{crop}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{String(area)} AC</span>
                  </div>
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 opacity-80"
                      style={{ width: `${percentage}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-zinc-400 w-8 text-right font-mono">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation instructions + CTA */}
      <div className="p-6 space-y-4 relative z-10">
        <div className="bg-zinc-900/50 rounded-xl p-3 border border-white/5">
          <p className="text-[9px] text-zinc-500 uppercase tracking-widest text-center font-mono flex items-center justify-center gap-2">
            <span className="text-cyan-400 font-bold">BLUEPRINT DIAGRAM</span> ACTIVE 
            <span className="w-1 h-1 bg-cyan-600 rounded-full" />
            <span className="text-zinc-500 font-bold">SCALE CALIBRATED</span>
          </p>
        </div>

        <button
          onClick={() => navigate(`/analysis/${strategy.id}`, { state: { strategy, request } })}
          className="group relative w-full overflow-hidden rounded-xl p-[1px]"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative w-full bg-zinc-900 rounded-xl py-3 px-6 flex items-center justify-center gap-2 transition-all duration-300 group-hover:bg-zinc-900/50">
             <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white">ACCESS DIAGNOSTICS</span>
             <ArrowRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
};
