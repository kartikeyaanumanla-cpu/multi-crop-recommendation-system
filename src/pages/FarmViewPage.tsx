import { type FC } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Strategy, RecommendationRequest } from '../types';
import { FarmHUD } from '../components/farm3d/FarmHUD';
import { FarmBlueprint } from '../components/farm2d/FarmBlueprint';
import { ArrowLeft, Map } from 'lucide-react';
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
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[calc(100vh-64px)] bg-slate-50">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 max-w-md">
          <Map className="w-16 h-16 text-slate-300 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-800 mb-3">No Plan Data Found</h2>
          <p className="text-slate-500 mb-8">Please select a plan from the comparison page to view details.</p>
          <button
            onClick={() => navigate('/dashboard/strategies')}
            className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex flex-col xl:flex-row text-slate-800 font-sans bg-slate-50 relative">
      
      {/* Main Display Area (Blueprint) */}
      <div className="flex-1 w-full p-6 lg:p-12 flex flex-col">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="bg-white text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Plans</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white px-8 py-3 rounded-2xl border border-slate-200 shadow-sm text-center"
          >
            <h1 className="text-lg font-bold text-slate-800 flex items-center justify-center gap-2">
              <Map className="w-5 h-5 text-emerald-600" /> {strategy.name}
            </h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase mt-1">
              {request.acres} Acres • {request.season} • {request.soilType} Soil
            </p>
          </motion.div>
          
          <div className="hidden md:block w-[140px]"></div> {/* Spacer for center alignment */}
        </div>

        <div className="flex-1 w-full flex items-center justify-center">
          <div className="w-full max-w-5xl">
            <FarmBlueprint strategy={strategy} request={request} />
          </div>
        </div>
      </div>

      {/* Sidebar Analytical HUD (Right Hand Control Panel) */}
      <div className="w-full xl:w-[400px] border-t xl:border-t-0 xl:border-l border-slate-200 bg-white shadow-xl flex-shrink-0">
        <div className="sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <FarmHUD strategy={strategy} request={request} />
        </div>
      </div>
      
    </div>
  );
};
