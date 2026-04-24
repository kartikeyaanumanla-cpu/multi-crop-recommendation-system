import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SuggestionRequest } from '../types';
import { LayoutDashboard, MapPin, Droplets, ThermometerSun, CloudRain, CheckSquare, Pipette } from 'lucide-react';
import { motion } from 'motion/react';
import { suggestCrops } from '../services/api';

export const FarmInputPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SuggestionRequest>({
    acres: 5,
    soilType: 'Black',
    soilPh: 6.5,
    rainfall: 800,
    irrigationAvailability: true,
    waterLevel: 'High',
    season: 'Kharif',
    N: 90,
    P: 42,
    K: 43,
    temperature: 20.8,
    humidity: 82.0
  });

  const detectWeather = () => {
    setWeatherError(null);
    setWeatherLoading(true);

    if (!navigator.geolocation) {
      setWeatherError('Geolocation is not supported by your browser');
      setWeatherLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const apiKey = (import.meta as any).env.VITE_OPENWEATHER_API_KEY;

          if (!apiKey) {
            throw new Error('API key not configured in .env');
          }

          // 1. Fetch Weather
          const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
          const weatherRes = await fetch(weatherUrl);
          const weatherData = await weatherRes.json();
          if (!weatherRes.ok) throw new Error(weatherData.message || 'Failed to fetch weather');

          // 2. Reverse Geocoding for State/District context
          const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;
          let state = '';
          let district = '';
          try {
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();
            if (geoData && geoData.length > 0) {
              state = geoData[0].state || '';
              district = geoData[0].name || '';
            }
          } catch(e) {
            console.warn('Geocoding failed, continuing without state/district.');
          }

          // 3. Try to fetch SoilGrids for Soil Ph, Nitrogen automatically
          let newPh = formData.soilPh;
          let newN = formData.N;
          try {
            const soilUrl = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${longitude}&lat=${latitude}&property=nitrogen&property=phh2o&depth=0-5cm&value=mean`;
            const soilRes = await fetch(soilUrl);
            
            if (soilRes.ok) {
              const soilData = await soilRes.json();
              if (soilData?.properties?.layers) {
                const reqProps = soilData.properties.layers;
                const phLayer = reqProps.find((l: any) => l.name === 'phh2o');
                if (phLayer && phLayer.depths[0].values.mean) {
                  newPh = Number((phLayer.depths[0].values.mean / 10).toFixed(1)); // ISRIC pHx10
                }
                const nLayer = reqProps.find((l: any) => l.name === 'nitrogen');
                if (nLayer && nLayer.depths[0].values.mean) {
                  // SoilGrids N is in cg/kg or roughly mapped. Setting a scaled approximation for the ML
                  newN = Math.max(20, Math.min(140, Math.round(nLayer.depths[0].values.mean / 20))); 
                }
              }
            } else {
              throw new Error("SoilGrids unavaliable");
            }
          } catch(e) {
            console.warn('SoilGrids API failed, using base default soil stats. Moving on with just Weather Data.', e);
          }

          // Update state with newly found data
          setFormData(prev => ({
            ...prev,
            temperature: Number(weatherData.main.temp.toFixed(1)),
            humidity: Number(weatherData.main.humidity.toFixed(1)),
            soilPh: newPh,
            N: newN !== prev.N ? newN : prev.N,
            state: state,
            district: district
          }));
        } catch (err: any) {
          console.error(err);
          setWeatherError(`Failed to fetch environmental data: ${err.message}. Please check your connection or manually input values.`);
        } finally {
          setWeatherLoading(false);
        }
      },
      (geoError) => {
        setWeatherError('Failed to retrieve location: ' + geoError.message);
        setWeatherLoading(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await suggestCrops(formData);
      navigate('/select-crop', { state: { requestData: formData, suggestionData: response } });
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'An unexpected error occurred while fetching crop suggestions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 text-gray-900 font-sans selection:bg-emerald-200 p-6 md:p-12 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-400/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-teal-400/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <header className="mb-10 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-serif italic tracking-tight text-emerald-950 mb-4 drop-shadow-sm">
              AgriIntelligence<span className="text-emerald-500">.</span>
            </h1>
            <p className="text-emerald-800/70 max-w-lg mx-auto leading-relaxed text-sm md:text-base font-medium">
              Enter your farm parameters to generate optimal multi-crop strategies tailored to your land and climate conditions.
            </p>
          </motion.div>
        </header>

        <motion.form 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onSubmit={handleSubmit} 
          className="bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-[32px] shadow-2xl shadow-emerald-900/5 border border-white/50"
        >
          <h2 className="text-xl font-semibold mb-8 flex items-center gap-3 text-emerald-950 border-b border-emerald-900/10 pb-4">
            <LayoutDashboard className="w-6 h-6 text-emerald-600" /> 
            Farm Parameters
          </h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-bold">Land Area (Acres)</label>
                <input 
                  type="number" 
                  value={formData.acres}
                  onChange={e => setFormData({...formData, acres: Number(e.target.value)})}
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-gray-700 font-medium"
                />
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-bold flex items-center gap-1.5">
                  <Pipette className="w-3.5 h-3.5" /> Soil pH
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  value={formData.soilPh}
                  onChange={e => setFormData({...formData, soilPh: Number(e.target.value)})}
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-gray-700 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-bold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Soil Type
                </label>
                <div className="relative">
                  <select 
                    value={formData.soilType}
                    onChange={e => setFormData({...formData, soilType: e.target.value})}
                    className="w-full p-4 bg-gray-50 rounded-2xl border-none appearance-none outline-none text-gray-700 font-medium"
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
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-bold flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5" /> Rainfall (mm)
                </label>
                <input 
                  type="number" 
                  value={formData.rainfall}
                  onChange={e => setFormData({...formData, rainfall: Number(e.target.value)})}
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-gray-700 font-medium"
                />
              </div>
            </div>

            {/* ML Specific Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-bold">Nitrogen (N)</label>
                <input 
                  type="number" 
                  value={formData.N}
                  onChange={e => setFormData({...formData, N: Number(e.target.value)})}
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-gray-700 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-bold">Phosphorus (P)</label>
                <input 
                  type="number" 
                  value={formData.P}
                  onChange={e => setFormData({...formData, P: Number(e.target.value)})}
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-gray-700 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-bold">Potassium (K)</label>
                <input 
                  type="number" 
                  value={formData.K}
                  onChange={e => setFormData({...formData, K: Number(e.target.value)})}
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-gray-700 font-medium"
                />
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 backdrop-blur-md p-5 rounded-2xl border border-emerald-100/50 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm shadow-emerald-900/5">
              <div className="text-sm text-emerald-900">
                <span className="font-semibold block mb-1 flex items-center gap-2"><ThermometerSun className="w-4 h-4 text-emerald-600"/> Auto-Detect Weather & Soil</span>
                Get real-time temperature, humidity and soil data via GPS.
              </div>
              <button
                type="button"
                onClick={detectWeather}
                disabled={weatherLoading}
                className="whitespace-nowrap bg-white text-emerald-700 font-semibold px-5 py-2.5 rounded-xl border border-emerald-100 hover:bg-emerald-50 hover:shadow-md transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2 cursor-pointer relative overflow-hidden"
              >
                {weatherLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" /> Detect Location
                  </>
                )}
              </button>
            </div>
            {weatherError && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: -15 }}
                className="bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-100 text-sm flex items-start gap-3 shadow-sm"
              >
                <div className="mt-0.5">⚠️</div>
                <div>
                  <b className="block">Weather Detection Issue</b>
                  <p className="opacity-90">{weatherError}</p>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-bold flex items-center gap-1.5">
                  <ThermometerSun className="w-3.5 h-3.5" /> Temperature (°C)
                </label>
                <input 
                  type="number" step="0.1"
                  value={formData.temperature}
                  onChange={e => setFormData({...formData, temperature: Number(e.target.value)})}
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-gray-700 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-bold flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5" /> Humidity (%)
                </label>
                <input 
                  type="number" step="0.1"
                  value={formData.humidity}
                  onChange={e => setFormData({...formData, humidity: Number(e.target.value)})}
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-gray-700 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-bold flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5" /> Water Level
                </label>
                <div className="relative">
                  <select 
                    value={formData.waterLevel}
                    onChange={e => setFormData({...formData, waterLevel: e.target.value as any})}
                    className="w-full p-4 bg-gray-50 rounded-2xl border-none appearance-none outline-none text-gray-700 font-medium"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                  <Droplets className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-bold flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5" /> Irrigation Availability
                </label>
                <div className="relative">
                  <select 
                    value={formData.irrigationAvailability ? 'Yes' : 'No'}
                    onChange={e => setFormData({...formData, irrigationAvailability: e.target.value === 'Yes'})}
                    className="w-full p-4 bg-gray-50 rounded-2xl border-none appearance-none outline-none text-gray-700 font-medium"
                  >
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                  <CheckSquare className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-bold flex items-center gap-1.5">
                  <ThermometerSun className="w-3.5 h-3.5" /> Season
                </label>
                <div className="relative">
                  <select 
                    value={formData.season}
                    onChange={e => setFormData({...formData, season: e.target.value as any})}
                    className="w-full p-4 bg-gray-50 rounded-2xl border-none appearance-none outline-none text-gray-700 font-medium"
                  >
                    <option>Kharif</option>
                    <option>Rabi</option>
                    <option>Zaid</option>
                  </select>
                  <ThermometerSun className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5 rounded-2xl font-semibold hover:from-emerald-500 hover:to-teal-500 transition-all shadow-xl shadow-emerald-900/10 disabled:opacity-70 active:scale-[0.98] text-lg flex items-center justify-center gap-2 border border-emerald-500/50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing Parameters Globally...
                </>
              ) : (
                'Generate Smart Crop Suggestions'
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};
