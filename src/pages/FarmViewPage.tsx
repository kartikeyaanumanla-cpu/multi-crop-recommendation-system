import { type FC } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Strategy, RecommendationRequest } from '../types';
import { FarmHUD } from '../components/farm3d/FarmHUD';
import { FarmBlueprint } from '../components/farm2d/FarmBlueprint';
import { ArrowLeft, Hexagon } from 'lucide-react';
import { motion } from 'motion/react';

export const FarmViewPage: FC = () => {
  const { strategyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { strategy, request } = (location.state as { strategy: Strategy; request: RecommendationRequest }) || {
    strategy: null,
    request: null,
  };

  if (!strategy || !request) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10 bg-[#050505] text-white">
        <Hexagon className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-widest">NO SPATIAL DATA</h2>
        <p className="text-zinc-400 mb-6 font-mono text-sm">Return to the selection matrix.</p>
        <button
          onClick={() => navigate('/strategies')}
          className="px-6 py-2 bg-zinc-900 border border-white/10 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors uppercase tracking-widest text-xs flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#070b13] relative flex text-white font-sans">
      
      {/* Blueprint ambient backdrop glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[45rem] h-[45rem] bg-cyan-950/15 rounded-full blur-[140px] mix-blend-screen opacity-30" />
      </div>

      {/* Back Button - floating top-left */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-20 bg-zinc-950/90 backdrop-blur-md text-cyan-400 hover:text-white font-bold flex items-center gap-2 px-5 py-2.5 rounded-xl border border-cyan-500/20 shadow-lg transition-all cursor-pointer hover:bg-cyan-900/40 uppercase tracking-widest text-[10px]"
      >
        <ArrowLeft className="w-4 h-4 text-cyan-400" />
        <span>BACK</span>
      </motion.button>

      {/* Blueprint Title Header - top-center */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-zinc-950/90 backdrop-blur-md px-8 py-3 rounded-2xl border border-cyan-500/20 shadow-lg text-center flex flex-col items-center gap-1"
      >
        <h1 className="text-lg font-black text-white uppercase tracking-[0.2em] flex items-center justify-center gap-3 drop-shadow-sm font-mono">
          <Hexagon className="w-4 h-4 text-cyan-400" /> {strategy.name}
        </h1>
        <p className="text-[10px] text-cyan-500 font-bold tracking-widest uppercase font-mono">
          {request.acres} AC · {request.season} · {request.soilType} SOIL TYPE
        </p>
      </motion.div>

      {/* Main Display Area (Left Hand 2D Blueprint Schematic) */}
      <div className="flex-1 relative z-10 h-full w-full flex items-center justify-center p-8 pr-[380px] pl-8 overflow-y-auto">
        <div className="w-full max-w-5xl max-h-[85vh] mt-12">
          <FarmBlueprint strategy={strategy} request={request} />
        </div>
      </div>

      {/* Sidebar Analytical HUD (Right Hand Control Panel) */}
      <FarmHUD strategy={strategy} request={request} />
    </div>
  );
};
