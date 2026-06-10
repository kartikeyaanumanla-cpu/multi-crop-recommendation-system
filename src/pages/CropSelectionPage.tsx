import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Leaf, ArrowRight, Sprout, TrendingUp, AlertCircle, Droplets, MapPin, Loader2, Hexagon } from 'lucide-react';
import { motion } from 'motion/react';
import { SuggestionRequest, SuggestionResponse, MainCropSuggestion } from '../types';
import { getRecommendation } from '../services/api';

export const CropSelectionPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Expected state passed from FarmInputPage
  const state = location.state as { requestData: SuggestionRequest; suggestionData: SuggestionResponse } | null;

  if (!state) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">NO DATA FOUND</h2>
        <p className="text-zinc-400 mb-6 font-mono text-sm">Please return to the input page and initialize the matrix.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-zinc-900 border border-white/10 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors uppercase tracking-widest text-xs"
        >
          Return to Input
        </button>
      </div>
    );
  }

  const { requestData, suggestionData } = state;

  const handleGenerateStrategies = async () => {
    if (!selectedCrop) return;
    setIsGenerating(true);
    setError(null);

    try {
      const fullRequest = {
        ...requestData,
        selectedMainCrop: selectedCrop
      };
      
      const response = await getRecommendation(fullRequest);
      navigate('/strategies', { state: { strategies: response.strategies, request: fullRequest } });
    } catch (err: any) {
      setError(err.message || 'Failed to generate strategies. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-12 relative overflow-hidden font-sans">
      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="inline-flex items-center justify-center p-3 bg-zinc-900/50 backdrop-blur-md rounded-xl border border-white/10 mb-4">
              <Hexagon className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm uppercase">
              CROP<span className="text-emerald-500 font-light">/SELECTION</span>
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl mx-auto mt-4 font-mono leading-relaxed">
              Based on your pH of <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">{requestData.soilPh}</span> and <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 uppercase">{requestData.season}</span> parameters, our algorithm suggests these compatible primary crops. 
              Select one to construct the architecture.
            </p>
          </motion.div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 backdrop-blur-sm max-w-2xl mx-auto">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Suggestion Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestionData.suggestions.map((reqCrop, idx) => {
            const isSelected = selectedCrop === reqCrop.cropName;
            
            return (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={reqCrop.cropName}
                onClick={() => setSelectedCrop(reqCrop.cropName)}
                className={`relative group bg-zinc-900/40 backdrop-blur-xl rounded-[2rem] border transition-all duration-300 cursor-pointer overflow-hidden shadow-2xl 
                  ${isSelected ? 'border-emerald-500 shadow-emerald-500/20' : 'border-white/5 hover:border-white/20'}`}
              >
                {/* Subtle grid pattern background */}
                <div className="absolute inset-0 rounded-[2rem] opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

                {/* Score Badge Header */}
                <div className={`flex items-center justify-between p-6 border-b transition-colors relative z-10
                  ${isSelected ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-zinc-950/50 border-white/5 group-hover:bg-zinc-900/50'}`}
                >
                  <h3 className="text-2xl font-bold text-white flex flex-col items-start gap-1">
                    {reqCrop.cropName}
                    {idx === 0 && <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full shadow-sm">OPTIMAL_MATCH</span>}
                  </h3>
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-zinc-500 uppercase tracking-widest text-[9px] mb-0.5">COMPATIBILITY</span>
                    <div className={`text-2xl font-black drop-shadow-sm ${reqCrop.matchScore > 80 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      {reqCrop.matchScore}%
                    </div>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 space-y-6 relative z-10">
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-400 font-mono leading-relaxed min-h-[44px]">
                      &gt; {reqCrop.reason}
                    </p>
                  </div>
                  
                  <div className="pt-5 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-zinc-950 rounded-xl border border-white/5 text-blue-400">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.15em]">BASE YIELD POTENTIAL</p>
                        <p className="text-lg font-bold text-white font-mono">{reqCrop.expectedYieldPerAcre.toLocaleString()} <span className="text-xs text-zinc-400">kg/ac</span></p>
                      </div>
                    </div>
                    {reqCrop.marketPrice && (
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-zinc-950 rounded-xl border border-white/5 text-emerald-400">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.15em] flex items-center flex-wrap gap-1">
                            MARKET_VAL ({reqCrop.marketPrice.market})
                            {reqCrop.marketPrice.isLive ? 
                              <span className="inline-flex items-center gap-1 text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold border border-emerald-500/30"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> LIVE</span> 
                              : 
                              <span className="inline-flex items-center gap-1 text-[8px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full font-bold border border-white/10">STATIC</span>
                            }
                          </p>
                          <p className="text-lg font-black text-emerald-400 font-mono">₹{reqCrop.marketPrice.pricePerKg.toFixed(2)} <span className="text-xs font-semibold opacity-70">/ kg</span></p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Overlay Indicator */}
                <div className={`absolute inset-0 border-2 border-emerald-500 rounded-[2rem] pointer-events-none transition-opacity duration-300
                  ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
              </motion.div>
            );
          })}
        </div>

        {/* Action Bar */}
        <div className="sticky bottom-6 flex justify-center mt-12 z-20">
          {selectedCrop ? (
            <button
              onClick={handleGenerateStrategies}
              disabled={isGenerating}
              className="group relative overflow-hidden rounded-xl p-[1px] w-full max-w-sm"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-xl opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-full bg-zinc-950 rounded-xl py-4 px-8 flex items-center justify-center gap-3 transition-all duration-300 group-hover:bg-zinc-900/50">
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                    <span className="font-bold tracking-widest text-white text-sm">GENERATING LAYOUTS...</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold tracking-widest text-white text-sm">BUILD ARCHITECTURE</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </>
                )}
              </div>
            </button>
          ) : (
            <div className="py-4 px-8 rounded-xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 shadow-lg text-center w-full max-w-sm">
              <span className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-xs">AWAITING NODE SELECTION</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
