import React from 'react';
import { RecommendationResponse } from '../types';
import { Sprout, BarChart3, PieChart } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  data: RecommendationResponse;
}

export const RecommendationResult: React.FC<Props> = ({ data }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl border border-white/5">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-bold mb-1">Optimal Primary Crop</p>
            <h3 className="text-4xl font-serif italic">{data.mainCrop}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <Sprout className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-4 h-4 text-gray-500" />
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Land Allocation</p>
            </div>
            <div className="space-y-3">
              {Object.entries(data.landDistribution).map(([crop, acres]) => (
                <div key={crop} className="group">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-300 font-medium">{crop}</span>
                    <span className="text-gray-500">{acres} Acres</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((acres as number) / (Object.values(data.landDistribution).reduce((a: number, b: number) => a + b, 0) as number)) * 100}%` }}
                      className="h-full bg-emerald-500/60 group-hover:bg-emerald-400 transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-gray-500" />
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Yield Projections</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(data.predictedYield).map(([crop, yieldVal]) => (
                <div key={crop} className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-colors">
                  <p className="text-[9px] uppercase text-gray-500 font-bold mb-1">{crop}</p>
                  <p className="text-xl font-mono text-emerald-50">{yieldVal.toLocaleString()}<span className="text-[10px] ml-1 text-gray-500">kg</span></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
        <p className="text-xs text-emerald-800 leading-relaxed">
          <span className="font-bold">Agronomist Note:</span> This multi-crop strategy is optimized for your {data.mainCrop} preference while maintaining soil health through nitrogen-fixing side crops like {data.sideCrops.join(' and ')}.
        </p>
      </div>
    </motion.div>
  );
};
