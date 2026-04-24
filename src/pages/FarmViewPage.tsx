import { Suspense, type FC } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Strategy, RecommendationRequest } from '../types';
import { FarmScene } from '../components/farm3d/FarmScene';
import { FarmHUD } from '../components/farm3d/FarmHUD';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

// Loading fallback inside the Canvas
function SceneLoader() {
  return null; // The HTML loader is rendered outside the canvas
}

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
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Strategy details not found. Please go back and select a strategy.</p>
          <button
            onClick={() => navigate('/strategies')}
            className="text-emerald-600 font-medium flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Strategies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] relative flex">
      {/* Back Button - floating top-left */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-20 bg-white/70 backdrop-blur-md text-emerald-800 hover:text-emerald-950 font-medium flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/60 shadow-lg shadow-emerald-900/5 hover:shadow-xl transition-all cursor-pointer hover:bg-white/90"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </motion.button>

      {/* Title overlay - top-center */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-white/70 backdrop-blur-md px-8 py-3 rounded-[24px] border border-white/60 shadow-lg shadow-emerald-900/5 text-center"
      >
        <h1 className="text-xl font-bold text-emerald-950 font-serif tracking-tight flex items-center justify-center gap-2 drop-shadow-sm">
          <span>🌿</span> {strategy.name}
        </h1>
        <p className="text-xs text-emerald-800/80 mt-1 font-medium tracking-wide">
          {request.acres} acres · {request.season} · {request.soilType} Soil
        </p>
      </motion.div>

      {/* 3D Canvas Area */}
      <div className="flex-1 relative">
        {/* Loading overlay */}
        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center bg-[#e8f5e9] z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <span className="text-sm text-gray-500 font-medium">Building your farm...</span>
              </div>
            </div>
          }
        >
          <Canvas
            shadows
            camera={{
              position: [8, 6, 8],
              fov: 45,
              near: 0.1,
              far: 100,
            }}
            style={{ width: '100%', height: '100%' }}
            gl={{ antialias: true, toneMapping: 3 /* ACESFilmic */ }}
          >
            <FarmScene strategy={strategy} request={request} />
          </Canvas>
        </Suspense>
      </div>

      {/* HUD Panel */}
      <FarmHUD strategy={strategy} request={request} />
    </div>
  );
};
