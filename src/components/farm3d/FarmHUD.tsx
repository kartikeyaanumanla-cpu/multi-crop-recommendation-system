import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Strategy, RecommendationRequest } from '../../types';
import { ArrowRight, Droplets, TrendingUp, ShieldAlert, Layers, Eye } from 'lucide-react';

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
      case 'Low': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' };
      case 'Medium': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' };
      case 'High': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100' };
    }
  };

  const riskStyle = getRiskStyle(strategy.riskLevel);

  return (
    <div className="absolute top-0 right-0 bottom-0 w-[340px] flex flex-col bg-white/85 backdrop-blur-xl border-l border-gray-200/50 shadow-2xl z-10 overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-100/80 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div className="flex items-center gap-2 mb-2 text-emerald-100">
          <Eye className="w-4 h-4" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold">3D Farm View</span>
        </div>
        <h2 className="text-xl font-bold mb-1">{strategy.name}</h2>
        <p className="text-emerald-100 text-xs leading-relaxed opacity-80">
          Visual layout for {request.acres} acres · {request.season} season
        </p>
      </div>

      {/* Score Ring */}
      <div className="p-6 flex items-center gap-6 border-b border-gray-100/80">
        <div className="relative inline-flex items-center justify-center flex-shrink-0">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#f3f4f6" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="34" fill="none"
              stroke="#10b981" strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - strategy.overallScore / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <span className="absolute text-2xl font-bold text-gray-800">{strategy.overallScore}</span>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Overall Score</div>
          <div className="text-sm text-gray-500">Combined water, profit, and suitability rating</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 p-6 border-b border-gray-100/80">
        <div className="bg-emerald-50/80 rounded-2xl p-3 border border-emerald-100/50">
          <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-[9px] uppercase tracking-wider font-bold">Profit</span>
          </div>
          <div className="text-lg font-bold text-gray-800">₹{strategy.estimatedProfit.toLocaleString()}</div>
        </div>

        <div className="bg-blue-50/80 rounded-2xl p-3 border border-blue-100/50">
          <div className="flex items-center gap-1.5 text-blue-500 mb-1">
            <Droplets className="w-3.5 h-3.5" />
            <span className="text-[9px] uppercase tracking-wider font-bold">Water</span>
          </div>
          <div className="text-lg font-bold text-gray-800">{strategy.waterUsageScore}/100</div>
        </div>

        <div className={`${riskStyle.bg} rounded-2xl p-3 border ${riskStyle.border}`}>
          <div className={`flex items-center gap-1.5 ${riskStyle.text} mb-1`}>
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="text-[9px] uppercase tracking-wider font-bold">Risk</span>
          </div>
          <div className="text-lg font-bold text-gray-800">{strategy.riskLevel}</div>
        </div>

        <div className="bg-purple-50/80 rounded-2xl p-3 border border-purple-100/50">
          <div className="flex items-center gap-1.5 text-purple-500 mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[9px] uppercase tracking-wider font-bold">Layout</span>
          </div>
          <div className="text-sm font-bold text-gray-800 capitalize truncate">{strategy.farmLayout?.layoutType || 'Mixed'}</div>
        </div>
      </div>

      {/* Crop Legend */}
      <div className="p-6 border-b border-gray-100/80 flex-1">
        <h3 className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-4">Crop Zones</h3>
        <div className="space-y-3">
          {Object.entries(strategy.landDistribution).map(([crop, areaVal]) => {
            const area = areaVal as number;
            const percentage = Math.round((area / request.acres) * 100);
            const color = CROP_COLORS[crop.toLowerCase()] || '#6B8B5E';
            return (
              <div key={crop} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-md flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold text-sm text-gray-700">{crop}</span>
                    <span className="text-xs text-gray-400 font-medium">{String(area)} ac</span>
                  </div>
                  <div className="h-1.5 mt-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${percentage}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-500 w-8 text-right">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation instructions + CTA */}
      <div className="p-6 space-y-4">
        <div className="bg-gray-50/80 rounded-2xl p-3 border border-gray-100">
          <p className="text-[11px] text-gray-500 leading-relaxed text-center">
            🖱️ <span className="font-medium text-gray-600">Drag</span> to rotate · <span className="font-medium text-gray-600">Scroll</span> to zoom · <span className="font-medium text-gray-600">Hover</span> on zones for details
          </p>
        </div>

        <button
          onClick={() => navigate(`/analysis/${strategy.id}`, { state: { strategy, request } })}
          className="w-full bg-emerald-600 text-white py-3.5 px-6 rounded-2xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
        >
          View Detailed Analysis
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
