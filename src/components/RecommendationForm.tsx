import React from 'react';
import { RecommendationRequest } from '../types';
import { LayoutDashboard, MapPin, Droplets, ThermometerSun } from 'lucide-react';

interface Props {
  onSubmit: (data: RecommendationRequest) => void;
  loading: boolean;
}

export const RecommendationForm: React.FC<Props> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = React.useState<RecommendationRequest>({
    acres: 5,
    soilType: 'Black',
    waterLevel: 'High',
    season: 'Kharif',
    preferredMainCrop: 'Cotton'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-800">
          <LayoutDashboard className="w-5 h-5 text-emerald-600" /> 
          Farm Parameters
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">Land Area (Acres)</label>
            <input 
              type="number" 
              value={formData.acres}
              onChange={e => setFormData({...formData, acres: Number(e.target.value)})}
              className="w-full p-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-gray-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">Soil Type</label>
              <div className="relative">
                <select 
                  value={formData.soilType}
                  onChange={e => setFormData({...formData, soilType: e.target.value})}
                  className="w-full p-3.5 bg-gray-50 rounded-2xl border-none appearance-none outline-none text-gray-700"
                >
                  <option>Black</option>
                  <option>Red</option>
                  <option>Alluvial</option>
                  <option>Sandy</option>
                </select>
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">Water Level</label>
              <div className="relative">
                <select 
                  value={formData.waterLevel}
                  onChange={e => setFormData({...formData, waterLevel: e.target.value as any})}
                  className="w-full p-3.5 bg-gray-50 rounded-2xl border-none appearance-none outline-none text-gray-700"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
                <Droplets className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">Season</label>
              <div className="relative">
                <select 
                  value={formData.season}
                  onChange={e => setFormData({...formData, season: e.target.value as any})}
                  className="w-full p-3.5 bg-gray-50 rounded-2xl border-none appearance-none outline-none text-gray-700"
                >
                  <option>Kharif</option>
                  <option>Rabi</option>
                  <option>Zaid</option>
                </select>
                <ThermometerSun className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">Main Crop</label>
              <input 
                type="text" 
                value={formData.preferredMainCrop}
                onChange={e => setFormData({...formData, preferredMainCrop: e.target.value})}
                className="w-full p-3.5 bg-gray-50 rounded-2xl border-none outline-none text-gray-700"
                placeholder="e.g. Cotton"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full mt-8 bg-emerald-600 text-white p-4 rounded-2xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 active:scale-[0.98]"
        >
          {loading ? 'Analyzing Soil Data...' : 'Generate Recommendation'}
        </button>
      </div>
    </form>
  );
};
