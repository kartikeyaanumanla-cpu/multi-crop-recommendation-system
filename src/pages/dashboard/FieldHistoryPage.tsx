import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Sprout, TrendingUp, ChevronRight, CheckCircle2, Trash2, Map, X, DollarSign, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FieldHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecId, setSelectedRecId] = useState<string | null>(null);
  const [harvestForm, setHarvestForm] = useState<{
    cropYields: Record<string, string>;
    revenue: string;
    notes: string;
  }>({ cropYields: {}, revenue: '', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalCrops, setModalCrops] = useState<string[]>([]);

  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const openHarvestModal = (rec: any) => {
    setSelectedRecId(rec._id);
    const topStrategy = rec.strategies[0];
    const crops = [topStrategy.mainCrop, ...(topStrategy.sideCrops || [])].filter(Boolean);
    
    setModalCrops(crops);
    const initialYields: Record<string, string> = {};
    crops.forEach(c => initialYields[c] = '');
    
    setHarvestForm({ cropYields: initialYields, revenue: '', notes: '' });
    setIsModalOpen(true);
  };

  const closeHarvestModal = () => {
    setIsModalOpen(false);
    setSelectedRecId(null);
  };

  const submitHarvestLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecId || !harvestForm.revenue) return;
    
    // Convert string yields to numbers
    const numericYields: Record<string, number> = {};
    for (const crop of modalCrops) {
      const val = harvestForm.cropYields[crop];
      if (!val) return; // Prevent submission if any yield is missing
      numericYields[crop] = Number(val);
    }

    setIsSubmitting(true);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/harvest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recommendationId: selectedRecId,
          cropYields: numericYields,
          actualProfit: Number(harvestForm.revenue), // Backend still uses actualProfit, but we treat it as revenue
          feedbackNotes: harvestForm.notes,
          harvestDate: new Date().toISOString()
        })
      });
      if (res.ok) {
        fetchHistory();
        closeHarvestModal();
      } else {
        alert('Failed to log harvest.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHistory = async (recId: string) => {
    if (!confirm('Are you sure you want to delete this history record?')) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/history/${recId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchHistory();
      } else {
        alert('Failed to delete record. Is your backend dev server updated?');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-8 relative">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Field History</h1>
        <p className="text-slate-500 mt-2 text-lg">Review past AI strategies and log actual harvest yields to improve future accuracy.</p>
      </header>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 text-center">
          <Sprout className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700">No Farm History Found</h2>
          <p className="text-slate-500 mt-2 mb-6">Generate your first AI crop strategy to begin tracking field performance over time.</p>
          <button 
            onClick={() => navigate('/dashboard/plan')}
            className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Create Plan
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {history.map((rec, idx) => (
            <motion.div 
              key={rec._id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                <div className="flex-1">
                  <div className="text-sm text-slate-500 font-bold tracking-wider uppercase mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    {new Date(rec.createdAt).toLocaleDateString()}
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-3">
                    {rec.requestPayload.acres} Acres • {rec.requestPayload.season} Season
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {rec.strategies.slice(0,3).map((strat: any) => (
                      <span key={strat.id} className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg capitalize border border-slate-200">
                        {strat.name} ({strat.mainCrop})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                  <button 
                    onClick={() => handleDeleteHistory(rec._id)}
                    className="p-3 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors border border-transparent hover:border-red-100"
                    title="Delete History"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  {rec.harvestLog ? (
                    <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl text-emerald-700 flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70">Harvest Logged</div>
                        <div className="text-base font-black tracking-tight">₹{rec.harvestLog.actualProfit.toLocaleString()} Gross</div>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => openHarvestModal(rec)}
                      className="px-5 py-3 bg-blue-50/50 text-blue-600 font-bold rounded-2xl hover:bg-blue-50 border border-blue-100/50 hover:border-blue-200 transition-colors flex items-center gap-2 text-sm"
                    >
                      <TrendingUp className="w-5 h-5" />
                      Log Harvest
                    </button>
                  )}

                  <button
                    onClick={() => navigate(`/dashboard/analysis/${rec.strategies[0].id}`, { state: { strategy: rec.strategies[0], request: rec.requestPayload } })}
                    className="px-5 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-2 text-sm w-full sm:w-auto justify-center"
                  >
                    <Map className="w-5 h-5" />
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Harvest Logging Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
              onClick={closeHarvestModal}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[2rem] shadow-2xl z-50 p-8 border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                  <Sprout className="w-6 h-6 text-emerald-600" /> Log Harvest
                </h3>
                <button onClick={closeHarvestModal} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={submitHarvestLog} className="space-y-5">
                <div className="space-y-4">
                  <div className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">Crop Yields</div>
                  {modalCrops.map(crop => (
                    <div key={crop}>
                      <label className="block text-xs font-bold text-slate-500 mb-1 capitalize">{crop} Yield (Kg)</label>
                      <div className="relative">
                        <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="number" required min="0"
                          value={harvestForm.cropYields[crop]}
                          onChange={e => setHarvestForm({
                            ...harvestForm, 
                            cropYields: { ...harvestForm.cropYields, [crop]: e.target.value }
                          })}
                          className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-800 text-sm"
                          placeholder={`Actual ${crop} harvested`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Total Gross Revenue Generated (₹)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                    <input 
                      type="number" required min="0"
                      value={harvestForm.revenue}
                      onChange={e => setHarvestForm({...harvestForm, revenue: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-bold text-emerald-700"
                      placeholder="e.g. 450000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Feedback / Notes <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <textarea 
                    rows={2}
                    value={harvestForm.notes}
                    onChange={e => setHarvestForm({...harvestForm, notes: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-800 resize-none text-sm"
                    placeholder="Any weather issues? Pests?"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-sm transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Save Harvest Log</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
