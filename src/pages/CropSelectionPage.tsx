import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Leaf, ArrowRight, Sprout, TrendingUp, AlertCircle, Droplets, MapPin, Loader2 } from 'lucide-react';
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Suggestion Data Found</h2>
        <p className="text-gray-600 mb-6">Please return to the input page and generate suggestions first.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          Back to Input
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-[#f8fcf9] to-teal-100/40 p-6 md:p-12 font-sans relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[30rem] h-[30rem] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-teal-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="inline-flex items-center justify-center p-4 bg-white/70 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-emerald-100/50 mb-2">
              <Sprout className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-950 tracking-tight mt-2 drop-shadow-sm">Select Base Crop</h1>
            <p className="text-lg text-emerald-800/80 max-w-2xl mx-auto mt-4 font-medium">
              Based on your pH of <span className="font-bold text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded-md">{requestData.soilPh}</span> and <span className="font-bold text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded-md capitalize">{requestData.season}</span> season, our AI suggests these highly-compatible pioneer crops. 
              Choose one to build multi-crop architectures around it.
            </p>
          </motion.div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
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
                className={`relative group bg-white/60 backdrop-blur-xl rounded-[32px] border-2 transition-all duration-300 cursor-pointer overflow-hidden shadow-lg 
                  ${isSelected ? 'border-emerald-500 shadow-emerald-500/20 shadow-2xl ring-4 ring-emerald-500/20' : 'border-white/50 hover:border-emerald-300 hover:bg-white/80'}`}
              >
                {/* Score Badge Header */}
                <div className={`flex items-center justify-between p-6 border-b transition-colors
                  ${isSelected ? 'bg-emerald-50/80 border-emerald-200/50' : 'bg-gray-50/30 border-gray-100/50 group-hover:bg-emerald-50/30'}`}
                >
                  <h3 className="text-2xl font-bold text-emerald-950 flex flex-col items-start gap-1">
                    {reqCrop.cropName}
                    {idx === 0 && <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 rounded-full shadow-sm">Top Pick</span>}
                  </h3>
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-emerald-800/50 uppercase tracking-widest text-[10px] mb-0.5">Match</span>
                    <div className={`text-2xl font-black drop-shadow-sm ${reqCrop.matchScore > 80 ? 'text-emerald-600' : 'text-amber-500'}`}>
                      {reqCrop.matchScore}%
                    </div>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700/80 font-medium leading-relaxed min-h-[44px]">
                      "{reqCrop.reason}"
                    </p>
                  </div>
                  
                  <div className="pt-5 border-t border-gray-100/50 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-blue-50/80 text-blue-600 rounded-xl shadow-[inset_0_2px_4px_rgb(0,0,0,0.02)] border border-blue-100/50">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Base Yield Pot.</p>
                        <p className="text-lg font-bold text-emerald-950">{reqCrop.expectedYieldPerAcre.toLocaleString()} kg/ac</p>
                      </div>
                    </div>
                    {reqCrop.marketPrice && (
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-emerald-50/80 text-emerald-600 rounded-xl shadow-[inset_0_2px_4px_rgb(0,0,0,0.02)] border border-emerald-100/50">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center flex-wrap gap-1">
                            Market Price ({reqCrop.marketPrice.market})
                            {reqCrop.marketPrice.isLive ? 
                              <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold shadow-sm ml-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> LIVE</span> 
                              : 
                              <span className="inline-flex items-center gap-1 text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-bold shadow-sm ml-1">HISTORIC</span>
                            }
                          </p>
                          <p className="text-lg font-black text-emerald-600">₹{reqCrop.marketPrice.pricePerKg.toFixed(2)} <span className="text-sm font-semibold opacity-70">/ kg</span></p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Overlay Indicator */}
                <div className={`absolute inset-0 border-4 border-emerald-500 rounded-[32px] pointer-events-none transition-opacity duration-300
                  ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
              </motion.div>
            );
          })}
        </div>

        {/* Action Bar */}
        <div className="sticky bottom-6 flex justify-center mt-12">
          {selectedCrop ? (
            <button
              onClick={handleGenerateStrategies}
              disabled={isGenerating}
              className="group flex flex-col items-center justify-center p-1 w-full max-w-sm rounded-[2rem] bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <div className="w-full rounded-full border border-white/20 py-4 px-8 flex items-center justify-center gap-3 relative overflow-hidden">
                {isGenerating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-lg font-bold tracking-wide">Generating Layouts...</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg font-bold tracking-wide">Build Farm Layouts</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:animate-shimmer" />
              </div>
            </button>
          ) : (
            <div className="py-4 px-8 rounded-full bg-white/60 backdrop-blur-xl border border-white/80 shadow-lg text-center w-full max-w-sm hover:shadow-xl transition-all">
              <span className="text-emerald-800/60 font-bold uppercase tracking-widest text-sm">Select a crop to continue</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
