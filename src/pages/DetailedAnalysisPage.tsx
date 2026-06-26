import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Strategy, RecommendationRequest } from '../types';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Droplets, ShieldAlert, Calendar, 
  Activity, Map, Layers, CheckCircle2, Save, Loader2, TrendingUp 
} from 'lucide-react';
import { Farm2DMap } from '../components/farm2d/Farm2DMap';
import { savePlanToHistory } from '../services/api';

// Crop growth duration mappings in days (aligned with backend app/crop_data.py)
const CROP_DURATIONS: Record<string, number> = {
  rice: 130,
  wheat: 120,
  maize: 100,
  sorghum: 110,
  'pearl millet': 80,
  soybean: 100,
  chickpea: 110,
  'green gram': 70,
  'black gram': 75,
  cowpea: 85,
  peanut: 110,
  mustard: 110,
  sunflower: 90,
  cotton: 160,
  sugarcane: 300,
  potato: 100,
  tomato: 90,
};

const getCropDuration = (cropName: string) => {
  return CROP_DURATIONS[cropName.toLowerCase()] || 100;
};

// Agronomic helper to define biological synergies in multi-crop layouts
const getSymbioticRelations = (mainCrop: string, sideCrops: string[]) => {
  const allCrops = [mainCrop, ...sideCrops];
  const synergies: { title: string; desc: string; type: 'soil' | 'pest' | 'structure' }[] = [];

  const isLegume = (crop: string) => 
    ['chickpea', 'lentil', 'groundnut', 'soybean', 'black gram', 'mungbean', 'pigeonpeas', 'green gram', 'cowpea', 'peanut'].includes(crop.toLowerCase());
  
  const isTall = (crop: string) => 
    ['maize', 'sugarcane', 'jute', 'sorghum'].includes(crop.toLowerCase());

  const isPestDeterrent = (crop: string) => 
    ['mustard', 'onion', 'garlic'].includes(crop.toLowerCase());

  const hasBroadLeaves = (crop: string) => 
    ['potato', 'tomato', 'watermelon', 'cotton'].includes(crop.toLowerCase());

  // 1. Check for nitrogen fixation
  const legumesList = allCrops.filter(isLegume);
  if (legumesList.length > 0) {
    synergies.push({
      title: 'Nitrogen Fixing Synergy',
      desc: `${legumesList.join(' & ')} fixes atmospheric nitrogen directly into the root zone, enriching soil fertility and reducing synthetic urea fertilizer requirements by 20-30% for surrounding crops.`,
      type: 'soil'
    });
  }

  // 2. Check for structural canopy support
  const tallList = allCrops.filter(isTall);
  if (tallList.length > 0) {
    synergies.push({
      title: 'Microclimatic Protection & Shade Canopy',
      desc: `${tallList.join(' & ')} provides an upper vertical tier that acts as a natural windbreak (shielding soil from wind-induced moisture loss) and protects sensitive low-lying crops from intense midday sun.`,
      type: 'structure'
    });
  }

  // 3. Pest deterrents
  const pestList = allCrops.filter(isPestDeterrent);
  if (pestList.length > 0) {
    synergies.push({
      title: 'Biological Pest Deterrence',
      desc: `${pestList.join(' & ')} serves as a trap/repellent crop, emitting aromatic sulfides or volatile organic compounds that deter common insect vectors (like whiteflies and aphids) from nesting on the primary crop.`,
      type: 'pest'
    });
  }

  // 4. Ground Cover
  const coverList = allCrops.filter(hasBroadLeaves);
  if (coverList.length > 0) {
    synergies.push({
      title: 'Living Mulch & Evaporation Buffering',
      desc: `${coverList.join(' & ')} provides horizontal leaf spread that covers the topsoil, acting as a living mulch to reduce soil water evaporation by up to 15% and suppress competing weed germination.`,
      type: 'soil'
    });
  }

  // Fallback deep root/shallow root system
  if (synergies.length === 0) {
    synergies.push({
      title: 'Nutrient Stratification',
      desc: `The combining of deep taproots (like ${mainCrop}) with shallow-rooted companion crops allows the system to pull nutrients and water from separate soil zones, preventing resource competition.`,
      type: 'soil'
    });
  }

  return synergies;
};

export const DetailedAnalysisPage: React.FC = () => {
  const { strategyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { strategy, request } = (location.state as { strategy: Strategy, request: RecommendationRequest }) || { strategy: null, request: null };

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!strategy || !request) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-screen bg-slate-50">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 max-w-md">
          <ShieldAlert className="w-16 h-16 text-amber-500 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-800 mb-3">No Plan Data Found</h2>
          <p className="text-slate-500 mb-8">Please return to the farming plans page to select a plan.</p>
          <button
            onClick={() => navigate('/dashboard/plan')}
            className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> Return to Plans
          </button>
        </div>
      </div>
    );
  }

  const layoutType = strategy.farmLayout?.layoutType?.toLowerCase() || 'block cropping';

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await savePlanToHistory(request, [strategy]);
      setIsSaved(true);
      alert('Plan saved successfully! It will now appear in your Active Plans history.');
    } catch (err: any) {
      alert('Failed to save plan: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50 p-6 md:p-12 font-sans relative">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-2 transition-colors bg-white px-5 py-2 rounded-xl border border-slate-200 shadow-sm text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Plans
              </button>
              <button 
                onClick={handleSave} 
                disabled={isSaving || isSaved}
                className="text-white font-semibold flex items-center gap-2 transition-colors bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:bg-slate-400 px-5 py-2 rounded-xl shadow-sm text-sm"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaved ? 'Saved to History' : 'Save This Plan'}
              </button>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 mb-3">
              {strategy.name}
            </h1>
            <p className="text-slate-500 max-w-xl leading-relaxed text-base mt-2">
              Detailed agronomic breakdown, expected yields, and spatial layout recommendations.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white px-8 py-5 rounded-[2rem] shadow-sm border border-slate-200 flex items-center gap-6"
          >
            <div className="text-center">
              <div className="text-xs text-slate-400 font-bold tracking-wider uppercase mb-1">Score</div>
              <div className="text-3xl font-bold text-emerald-600">{strategy.overallScore}</div>
            </div>
            <div className="w-px h-12 bg-slate-200 mx-2"></div>
            <div className="text-center">
              <div className="text-xs text-slate-400 font-bold tracking-wider uppercase mb-1">Expected Revenue</div>
              <div className="text-xl font-bold text-slate-800">₹{(strategy.estimatedProfit / 1000).toFixed(1)}k</div>
            </div>
            {strategy.marketPrice && (
              <>
                <div className="w-px h-12 bg-slate-200 mx-2"></div>
                <div className="text-center">
                  <div className="text-xs text-emerald-600 font-bold tracking-wider uppercase mb-1 flex items-center justify-center gap-1.5 capitalize">
                    {strategy.mainCrop}
                    {strategy.marketPrice.isLive ? 
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Live</span> 
                        : 
                        <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">Static</span>
                    }
                  </div>
                  <div className="text-xl font-bold text-emerald-700">₹{strategy.marketPrice.pricePerKg.toFixed(2)}<span className="text-xs text-slate-500 font-medium">/kg</span></div>
                </div>
              </>
            )}
          </motion.div>
        </header>

        <div className="space-y-10">
          
          {/* Top Row: Yield Breakdown & Hydro Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* 1. Crop Breakdown Table */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-extrabold tracking-tight mb-8 flex items-center gap-3 text-slate-800">
                <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600">
                  <Activity className="w-6 h-6" />
                </div>
                Yield & Resource Breakdown
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans">
                  <thead>
                    <tr className="border-b-2 border-slate-100">
                      <th className="pb-4 text-xs tracking-wider text-slate-400 font-bold uppercase">Crop</th>
                      <th className="pb-4 text-xs tracking-wider text-slate-400 font-bold uppercase">Area</th>
                      <th className="pb-4 text-xs tracking-wider text-slate-400 font-bold uppercase">Est. Yield</th>
                      <th className="pb-4 text-xs tracking-wider text-slate-400 font-bold uppercase">Water Need</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {Object.keys(strategy.landDistribution).map(crop => (
                      <tr key={crop} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-6 font-bold text-slate-700 flex items-center gap-3 capitalize text-base">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" /> {crop}
                        </td>
                        <td className="py-6 text-slate-600 font-medium text-base">{strategy.landDistribution[crop]} Acres</td>
                        <td className="py-6 text-emerald-600 font-bold text-base">{strategy.predictedYield[crop]?.toLocaleString()} kg</td>
                        <td className="py-6">
                          <div className="text-blue-600 font-bold text-base flex items-center gap-1.5">
                            <Droplets className="w-4 h-4" /> {strategy.waterRequirementPerCrop[crop]} mm
                          </div>
                          <div className="text-xs text-slate-500 font-medium mt-1">
                            ~{(strategy.waterRequirementPerCrop[crop] * 4047).toLocaleString()} L/Acre
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Hydro Profile */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-blue-50/50 p-8 md:p-10 rounded-[2.5rem] border border-blue-100/60 hover:shadow-md hover:bg-blue-50 transition-all"
            >
              <h2 className="text-lg font-extrabold tracking-tight mb-8 flex items-center gap-3 text-blue-800">
                <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600">
                  <Droplets className="w-6 h-6" />
                </div>
                Water Efficiency
              </h2>
              
              <div className="flex flex-col items-center justify-center mb-10 py-6 bg-white rounded-3xl border border-blue-100/50 shadow-sm">
                <div className="text-6xl font-black text-blue-600 mb-2 tracking-tighter">{strategy.waterUsageScore}<span className="text-3xl text-blue-300 font-bold">/100</span></div>
                <div className="text-sm uppercase tracking-widest font-bold text-blue-400">Efficiency Rating</div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                {Object.entries(strategy.waterRequirementPerCrop).map(([crop, req]) => {
                  const liters = req * 4047;
                  const frequency = req > 1000 ? '2-3x / week' : (req > 500 ? '1-2x / week' : 'Every 7-10 days');
                  return (
                  <div key={crop} className="bg-white p-5 rounded-2xl border border-blue-100/50 shadow-sm hover:border-blue-200 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-slate-700 font-bold capitalize flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block" />
                        {crop}
                        </span>
                        <span className="text-blue-700 font-bold text-lg">{req} <span className="text-sm text-blue-400 font-medium">mm</span></span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 border-t border-slate-50 pt-3">
                       <span>Total: <span className="text-blue-600">{liters.toLocaleString()} L/Acre</span></span>
                       <span>Freq: <span className="text-blue-600">{frequency}</span></span>
                    </div>
                  </div>
                )})}
              </div>
            </motion.div>

          </div>

          {/* 2. Schematic Map Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-200"
          >
            <h2 className="text-lg font-extrabold tracking-tight mb-8 flex items-center gap-3 text-slate-800">
              <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600">
                <Map className="w-6 h-6" />
              </div>
              Farm Blueprint
            </h2>
            <div className="max-w-4xl mx-auto w-full">
              <Farm2DMap strategy={strategy} request={request} />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 4. Spatial layout & Sowing text protocol */}
            {strategy.farmLayout && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-emerald-50/50 p-8 md:p-10 rounded-[2.5rem] border border-emerald-100/60 flex flex-col"
              >
                <h2 className="text-lg font-extrabold tracking-tight mb-6 text-emerald-800 flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600">
                    <Layers className="w-6 h-6" />
                  </div>
                  Spatial Layout
                </h2>

                <div className="flex items-center gap-2 mb-6 bg-white w-max px-5 py-2.5 rounded-xl border border-emerald-100 text-sm font-bold uppercase tracking-widest text-emerald-700 shadow-sm">
                    {strategy.farmLayout.layoutType}
                </div>

                <p className="text-emerald-900/80 text-base leading-relaxed mb-8 font-medium">
                  {layoutType.includes('block') 
                    ? 'Block Cropping partitions the field into large, separate blocks. This is ideal for maximizing farm machinery usage (like tractors) and simplifies harvesting since each crop has its own dedicated zone.' 
                    : layoutType.includes('strip') 
                    ? 'Strip Cropping places crops in wide alternating horizontal strips. This is a highly effective conservation layout that acts as a physical barrier to capture water runoff and prevent soil erosion.' 
                    : 'Row Intercropping plants crops in alternating vertical rows. This layout maximizes spatial light interception and enhances biological nutrient transfer between companion crops.'}
                </p>
                
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100 text-slate-700 mt-auto">
                  <h4 className="text-sm font-bold tracking-widest uppercase text-emerald-600 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Recommended Protocol
                  </h4>
                  <p className="text-base font-medium leading-relaxed">{strategy.farmLayout.sowingPattern}</p>
                </div>
              </motion.div>
            )}

            {/* 5. Estimated Crop Harvest Times */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-200"
            >
              <h2 className="text-lg font-extrabold tracking-tight mb-8 flex items-center gap-3 text-slate-800">
                <div className="p-2.5 bg-purple-100 rounded-xl text-purple-600">
                  <Calendar className="w-6 h-6" />
                </div>
                Harvest Timelines
              </h2>
              
              <div className="space-y-5">
                {[strategy.mainCrop, ...strategy.sideCrops].map((crop, idx) => {
                  const duration = getCropDuration(crop);
                  const months = (duration / 30).toFixed(1);
                  return (
                    <div key={crop} className="bg-slate-50 border border-slate-100/80 rounded-3xl p-6 flex items-center justify-between gap-4 hover:shadow-sm transition-all hover:bg-white hover:border-slate-200 group">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-slate-200 text-slate-600 font-black text-lg shadow-sm group-hover:text-emerald-600 group-hover:border-emerald-200 transition-colors">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-800 capitalize mb-1">{crop}</h4>
                          <span className="text-sm text-slate-500 font-semibold bg-slate-100 px-3 py-1 rounded-lg">
                            {idx === 0 ? 'Primary Crop' : `Companion Crop ${idx}`}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-emerald-600 tracking-tight">
                          {duration} <span className="text-sm font-bold text-emerald-600/70">Days</span>
                        </div>
                        <div className="text-sm text-slate-500 font-bold mt-1">
                          ~{months} Months
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};
