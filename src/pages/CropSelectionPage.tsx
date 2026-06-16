import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Leaf, ArrowRight, TrendingUp, AlertCircle, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { SuggestionRequest, SuggestionResponse } from '../types';
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
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-screen bg-slate-50">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 max-w-md">
          <AlertCircle className="w-16 h-16 text-amber-500 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-800 mb-3">No Farm Data Found</h2>
          <p className="text-slate-500 mb-8">Please return to the first step and fill out your farm details to get crop recommendations.</p>
          <button
            onClick={() => navigate('/dashboard/plan')}
            className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Go Back
          </button>
        </div>
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
      navigate('/dashboard/strategies', { state: { strategies: response.strategies, request: fullRequest } });
    } catch (err: any) {
      setError(err.message || 'Failed to generate strategies. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4 pt-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-2xl mb-4 text-emerald-600 shadow-sm border border-emerald-200">
              <Leaf className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
              Recommended Crops
            </h1>
            <p className="text-slate-500 max-w-2xl mx-auto mt-4 leading-relaxed text-base">
              Based on your farm's <span className="font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">pH of {requestData.soilPh}</span> and the <span className="font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">{requestData.season}</span> season, these are the best primary crops for you. Select one to see detailed farming plans.
            </p>
          </motion.div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 max-w-2xl mx-auto">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Suggestion Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {suggestionData.suggestions.map((reqCrop, idx) => {
            const isSelected = selectedCrop === reqCrop.cropName;
            
            return (
              <motion.div 
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                key={reqCrop.cropName}
                onClick={() => setSelectedCrop(reqCrop.cropName)}
                className={`relative group bg-white rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden
                  ${isSelected ? 'border-2 border-emerald-500 shadow-[0_8px_30px_rgb(16,185,129,0.15)]' : 'border border-slate-200 shadow-sm hover:shadow-md'}`}
              >
                {/* Score Badge Header */}
                <div className={`flex items-start justify-between p-6 border-b transition-colors
                  ${isSelected ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-100 group-hover:bg-slate-50'}`}
                >
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      {reqCrop.cropName}
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    </h3>
                    {idx === 0 && (
                      <span className="inline-block px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full border border-emerald-200">
                        Top Match
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end text-right">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Match Score</span>
                    <div className={`text-2xl font-black ${reqCrop.matchScore > 80 ? 'text-emerald-600' : 'text-amber-500'}`}>
                      {reqCrop.matchScore}%
                    </div>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 space-y-6">
                  <p className="text-sm text-slate-600 leading-relaxed min-h-[48px]">
                    {reqCrop.reason}
                  </p>
                  
                  <div className="pt-6 border-t border-slate-100 space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expected Yield</p>
                        <p className="text-lg font-bold text-slate-800">{reqCrop.expectedYieldPerAcre.toLocaleString()} <span className="text-sm font-medium text-slate-500">kg/acre</span></p>
                      </div>
                    </div>

                    {reqCrop.marketPrice && (
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                              Market Price ({reqCrop.marketPrice.market})
                            </p>
                            {reqCrop.marketPrice.isLive ? (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> LIVE
                              </span> 
                            ) : (
                              <span className="inline-flex items-center text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold border border-slate-200">
                                ESTIMATE
                              </span>
                            )}
                          </div>
                          <p className="text-lg font-bold text-slate-800">
                            ₹{reqCrop.marketPrice.pricePerKg.toFixed(2)} <span className="text-sm font-medium text-slate-500">/ kg</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Action Bar */}
        <div className="sticky bottom-8 flex justify-center mt-12 z-20">
          {selectedCrop ? (
            <button
              onClick={handleGenerateStrategies}
              disabled={isGenerating}
              className="w-full max-w-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-4 px-8 flex items-center justify-center gap-3 transition-all duration-300 font-bold shadow-[0_8px_30px_rgb(16,185,129,0.3)] text-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Building Farming Plans...</span>
                </>
              ) : (
                <>
                  <span>Continue with {selectedCrop}</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </>
              )}
            </button>
          ) : (
            <div className="py-4 px-8 rounded-2xl bg-white border border-slate-200 shadow-sm text-center w-full max-w-sm">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">Select a crop to continue</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
