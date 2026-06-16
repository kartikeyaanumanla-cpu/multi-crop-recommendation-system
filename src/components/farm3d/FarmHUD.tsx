import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Strategy, RecommendationRequest } from '../../types';
import { ArrowRight, Droplets, TrendingUp, ShieldAlert, Layers, Map } from 'lucide-react';

// Color mapping matching crop zone ground colors
const CROP_COLORS: Record<string, string> = {
  rice: '#10b981', wheat: '#f59e0b', maize: '#84cc16', cotton: '#06b6d4',
  sugarcane: '#059669', jute: '#b45309', mustard: '#eab308', lentil: '#ef4444',
  chickpea: '#f97316', millet: '#d97706', sorghum: '#c2410c', groundnut: '#854d0e',
  soybean: '#22c55e', potato: '#78716c', tomato: '#dc2626',
};

interface FarmHUDProps {
  strategy: Strategy;
  request: RecommendationRequest;
}

export const FarmHUD: FC<FarmHUDProps> = ({ strategy, request }) => {
  const navigate = useNavigate();

  const getRiskStyle = (risk: string) => {
    switch (risk) {
      case 'Low': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' };
      case 'Medium': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' };
      case 'High': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' };
    }
  };

  const riskStyle = getRiskStyle(strategy.riskLevel);

  return (
    <div className="w-full flex flex-col bg-white overflow-y-auto text-slate-800 font-sans min-h-full">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50 relative z-10">
        <div className="flex items-center gap-2 mb-3 text-emerald-600">
          <Map className="w-5 h-5" />
          <span className="text-xs uppercase tracking-wider font-bold">Plan Details</span>
        </div>
        <h2 className="text-2xl font-bold mb-1 text-slate-800">{strategy.name}</h2>
        <p className="text-slate-500 text-sm font-medium">
          {request.acres} Acres • {request.season}
        </p>
      </div>

      {/* Score Ring */}
      <div className="p-6 flex items-center gap-6 border-b border-slate-100 relative z-10 bg-white">
        <div className="relative inline-flex items-center justify-center flex-shrink-0">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#f1f5f9" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="34" fill="none"
              stroke="#10b981" strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - strategy.overallScore / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <span className="absolute text-2xl font-bold text-slate-800">{strategy.overallScore}</span>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Overall Score</div>
          <div className="text-xs text-slate-400 font-medium">Based on yield, water, and revenue</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 p-6 border-b border-slate-100 relative z-10 bg-white">
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-bold">Expected Revenue</span>
          </div>
          <div className="text-lg font-bold text-emerald-700">₹{strategy.estimatedProfit.toLocaleString()}</div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Droplets className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-bold">Water Efficiency</span>
          </div>
          <div className="text-lg font-bold text-blue-700">{strategy.waterUsageScore}<span className="text-blue-400 text-sm">/100</span></div>
        </div>

        <div className={`${riskStyle.bg} rounded-xl p-4 border ${riskStyle.border}`}>
          <div className={`flex items-center gap-2 ${riskStyle.text} mb-2`}>
            <ShieldAlert className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-bold">Risk Level</span>
          </div>
          <div className={`text-lg font-bold ${riskStyle.text}`}>{strategy.riskLevel}</div>
        </div>

        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Layers className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-bold">Layout</span>
          </div>
          <div className="text-lg font-bold text-indigo-700 truncate">{strategy.farmLayout?.layoutType || 'Mixed'}</div>
        </div>
      </div>

      {/* Crop Legend */}
      <div className="p-6 border-b border-slate-100 flex-1 relative z-10 bg-white">
        <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-5">Land Distribution</h3>
        <div className="space-y-5">
          {Object.entries(strategy.landDistribution).map(([crop, areaVal]) => {
            const area = areaVal as number;
            const percentage = Math.round((area / request.acres) * 100);
            const color = CROP_COLORS[crop.toLowerCase()] || '#10b981';
            return (
              <div key={crop} className="flex items-center gap-4">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 border border-slate-200"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-bold text-sm text-slate-700 capitalize">{crop}</span>
                    <span className="text-xs text-slate-500 font-medium">{String(area)} Acres</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${percentage}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-600 w-10 text-right">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation CTA */}
      <div className="p-6 bg-slate-50 relative z-10 mt-auto">
        <button
          onClick={() => navigate(`/dashboard/analysis/${strategy.id}`, { state: { strategy, request } })}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-4 px-6 flex items-center justify-center gap-3 transition-all duration-300 shadow-md font-bold text-base"
        >
          <span>View Detailed Analysis</span>
          <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};
