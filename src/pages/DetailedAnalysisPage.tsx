import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Strategy, RecommendationRequest } from '../types';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Droplets, TrendingUp, ShieldAlert, Calendar, Sprout, 
  Activity, Map, Layers, Hexagon, Cpu, Info, CheckCircle2 
} from 'lucide-react';
import { Farm2DMap } from '../components/farm2d/Farm2DMap';

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

  if (!strategy || !request) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10 bg-[#050505]">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-widest">DATA NOT FOUND</h2>
        <p className="text-zinc-400 mb-6 font-mono text-sm">Please return to the strategy matrix.</p>
        <button
          onClick={() => navigate('/compare')}
          className="px-6 py-2 bg-zinc-900 border border-white/10 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors uppercase tracking-widest text-xs flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Return
        </button>
      </div>
    );
  }

  const layoutType = strategy.farmLayout?.layoutType?.toLowerCase() || 'block cropping';

  return (
    <div className="flex-1 p-6 md:p-12 font-sans relative overflow-hidden text-zinc-300 bg-[#070708]">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-emerald-950/10 rounded-full blur-[120px] mix-blend-screen opacity-20" />
        <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-blue-950/10 rounded-full blur-[120px] mix-blend-screen opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-white font-bold flex items-center gap-2 mb-8 transition-colors bg-zinc-900/50 backdrop-blur-md px-5 py-2 rounded-xl border border-white/10 text-xs uppercase tracking-widest cursor-pointer">
              <ArrowLeft className="w-4 h-4" /> RETURN TO MATRIX
            </button>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3 drop-shadow-sm uppercase">
              {strategy.name}
            </h1>
            <p className="text-zinc-400 max-w-xl leading-relaxed text-sm font-mono mt-2">
              Detailed agronomic diagnostics, ML model validations, and spatial layout simulations.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900/60 backdrop-blur-2xl px-8 py-5 rounded-[2rem] shadow-2xl border border-white/10 flex items-center gap-6"
          >
            <div className="text-center">
              <div className="text-[10px] text-zinc-500 font-bold tracking-[0.15em] uppercase mb-1">SCORE</div>
              <div className="text-3xl font-black text-emerald-400 font-mono">{strategy.overallScore}</div>
            </div>
            <div className="w-px h-12 bg-white/10 mx-2"></div>
            <div className="text-center">
              <div className="text-[10px] text-zinc-500 font-bold tracking-[0.15em] uppercase mb-1">PROFIT</div>
              <div className="text-xl font-bold text-white font-mono">₹{(strategy.estimatedProfit / 1000).toFixed(1)}k</div>
            </div>
            {strategy.marketPrice && (
              <>
                <div className="w-px h-12 bg-white/10 mx-2"></div>
                <div className="text-center">
                  <div className="text-[10px] text-emerald-500 font-bold tracking-[0.15em] uppercase mb-1 flex items-center justify-center gap-1.5 font-sans">
                    {strategy.mainCrop}
                    {strategy.marketPrice.isLive ? 
                        <span className="inline-flex items-center gap-1 text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/30"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> LIVE</span> 
                        : 
                        <span className="inline-flex items-center gap-1 text-[8px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full border border-white/10">STATIC</span>
                    }
                  </div>
                  <div className="text-xl font-bold text-emerald-400 font-mono">₹{strategy.marketPrice.pricePerKg.toFixed(2)}<span className="text-[10px] text-zinc-500 font-medium">/kg</span></div>
                </div>
              </>
            )}
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats, Layout Map, Synergies */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Crop Breakdown Table */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/40 backdrop-blur-2xl p-8 rounded-[2rem] shadow-2xl border border-white/10 relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
              
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase mb-8 flex items-center gap-3 text-white relative z-10 border-b border-white/10 pb-4">
                <Activity className="w-4 h-4 text-emerald-400" />
                Yield Allocation Breakdown
              </h2>
              
              <div className="overflow-x-auto relative z-10">
                <table className="w-full text-left font-sans">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="pb-4 text-[10px] tracking-[0.15em] text-zinc-500 font-bold uppercase">CROP (NODE)</th>
                      <th className="pb-4 text-[10px] tracking-[0.15em] text-zinc-500 font-bold uppercase">AREA (AC)</th>
                      <th className="pb-4 text-[10px] tracking-[0.15em] text-zinc-500 font-bold uppercase">EST. YIELD</th>
                      <th className="pb-4 text-[10px] tracking-[0.15em] text-zinc-500 font-bold uppercase">HYDRO REQ.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-sm">
                    {Object.keys(strategy.landDistribution).map(crop => (
                      <tr key={crop} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-5 font-bold text-white flex items-center gap-3 uppercase font-sans text-xs">
                          <Hexagon className="w-3 h-3 text-emerald-500" /> {crop}
                        </td>
                        <td className="py-5 text-zinc-400">{strategy.landDistribution[crop]} AC</td>
                        <td className="py-5 text-emerald-400 font-bold">{strategy.predictedYield[crop]} KG</td>
                        <td className="py-5 text-blue-400 font-bold flex items-center gap-1.5">
                          <Droplets className="w-3.5 h-3.5" /> {strategy.waterRequirementPerCrop[crop]} MM
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* 2. Schematic Map Visualization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Farm2DMap strategy={strategy} request={request} />
            </motion.div>

            {/* 4. Spatial layout & Sowing text protocol */}
            {strategy.farmLayout && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-zinc-950 p-8 rounded-[2rem] shadow-2xl border border-emerald-500/20 text-white relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-br from-emerald-500/20 to-transparent" />
                <div className="flex flex-col md:flex-row gap-6 items-start justify-between relative z-10">
                  <div className="flex-1">
                    <h2 className="text-sm font-bold tracking-[0.2em] uppercase mb-4 text-white flex items-center gap-3">
                      <Map className="w-4 h-4 text-emerald-400" />
                      Spatial Layout & Sowing Protocol
                    </h2>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-mono">
                      {layoutType.includes('block') 
                        ? 'Block Cropping partitions the field into large, separate blocks. This is ideal for maximizing farm machinery usage (like tractors) and simplifies harvesting since each crop has its own dedicated zone.' 
                        : layoutType.includes('strip') 
                        ? 'Strip Cropping places crops in wide alternating horizontal strips. This is a highly effective conservation layout that acts as a physical barrier to capture water runoff and prevent soil erosion.' 
                        : 'Row Intercropping plants crops in alternating vertical rows. This layout maximizes spatial light interception and enhances biological nutrient transfer between companion crops.'}
                    </p>
                    
                    <div className="flex items-center gap-3 mb-4 bg-zinc-900 w-max px-4 py-2 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest text-zinc-300">
                       <Layers className="w-4 h-4 text-emerald-400" />
                       {strategy.farmLayout.layoutType}
                    </div>
                  </div>
                  
                  <div className="bg-zinc-900 p-6 rounded-2xl md:max-w-[280px] shadow-inner border border-white/5 text-zinc-300 self-stretch flex flex-col justify-center">
                    <h4 className="text-[9px] font-bold tracking-[0.15em] uppercase text-emerald-500 mb-3">RECOMMENDED PROTOCOL</h4>
                    <p className="text-sm font-medium leading-relaxed font-mono">{strategy.farmLayout.sowingPattern}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 5. Estimated Crop Harvest Times */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="bg-zinc-900/40 backdrop-blur-2xl p-8 rounded-[2rem] shadow-2xl border border-white/10"
            >
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase mb-6 flex items-center gap-3 text-white border-b border-white/10 pb-4">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Estimated Crop Harvest Times
              </h2>
              
              <div className="space-y-4">
                {[strategy.mainCrop, ...strategy.sideCrops].map((crop, idx) => {
                  const duration = getCropDuration(crop);
                  const months = (duration / 30).toFixed(1);
                  return (
                    <div key={crop} className="bg-zinc-950/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 font-bold text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white uppercase">{crop}</h4>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {idx === 0 ? 'Primary Crop' : `Companion Crop ${idx}`}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-emerald-400 font-mono">
                          {duration} Days
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          ~{months} Months
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Hydro Profile */}
          <div className="space-y-8">

            {/* 2. Hydro Profile */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-blue-950/20 backdrop-blur-2xl p-8 rounded-[2rem] shadow-2xl border border-blue-500/20"
            >
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase mb-6 flex items-center gap-3 text-blue-400 border-b border-blue-500/20 pb-4">
                <Droplets className="w-4 h-4" />
                Hydro Profile
              </h2>
              
              <div className="text-center mb-8">
                <div className="text-5xl font-black text-blue-400 mb-2 font-mono">{strategy.waterUsageScore}<span className="text-2xl text-blue-500/50">/100</span></div>
                <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-blue-500">EFFICIENCY METRIC</div>
              </div>
              
              <ul className="space-y-4 font-sans">
                {Object.entries(strategy.waterRequirementPerCrop).map(([crop, req]) => (
                  <li key={crop} className="flex justify-between text-sm items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-blue-500 rounded-full inline-block" />
                       {crop}
                    </span>
                    <span className="text-blue-400 font-mono font-bold bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">{req} MM</span>
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
