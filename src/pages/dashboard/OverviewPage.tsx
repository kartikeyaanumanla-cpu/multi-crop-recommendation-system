import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Activity, History } from 'lucide-react';
import { motion } from 'motion/react';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeCount, setActiveCount] = useState(0);
  const [harvestCount, setHarvestCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Active plans are those without a harvest log
          const active = data.filter((rec: any) => !rec.harvestLog).length;
          // Past harvests are those with a harvest log
          const harvested = data.filter((rec: any) => rec.harvestLog).length;
          
          setActiveCount(active);
          setHarvestCount(harvested);
        }
      } catch (err) {
        console.error('Failed to fetch history metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome back, {user.name || 'Farmer'}</h1>
        <p className="text-slate-500 mt-2 text-lg">Here is your farm's high-level overview.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all group"
          onClick={() => navigate('/dashboard/plan')}
        >
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">New AI Plan</h3>
          <p className="text-slate-500 text-sm mt-1">Generate a new crop recommendation</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-300 transition-all"
          onClick={() => navigate('/dashboard/history')}
        >
          <div className="flex items-center gap-3 mb-4 text-blue-600">
            <Activity className="w-6 h-6" />
            <h3 className="text-lg font-bold text-slate-800">Active Plans</h3>
          </div>
          <div className="text-4xl font-extrabold text-slate-800">
            {loading ? <span className="animate-pulse text-slate-300">...</span> : activeCount}
          </div>
          <p className="text-slate-500 text-sm mt-2">Currently tracked in your history</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 cursor-pointer hover:border-purple-300 transition-all"
          onClick={() => navigate('/dashboard/history')}
        >
          <div className="flex items-center gap-3 mb-4 text-purple-600">
            <History className="w-6 h-6" />
            <h3 className="text-lg font-bold text-slate-800">Past Harvests</h3>
          </div>
          <div className="text-4xl font-extrabold text-slate-800">
            {loading ? <span className="animate-pulse text-slate-300">...</span> : harvestCount}
          </div>
          <p className="text-slate-500 text-sm mt-2">Logged harvest results</p>
        </motion.div>
      </div>
    </div>
  );
};
