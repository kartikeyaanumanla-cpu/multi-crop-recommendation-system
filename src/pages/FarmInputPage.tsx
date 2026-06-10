import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SuggestionRequest } from '../types';
import { Hexagon, MapPin, Droplets, ThermometerSun, CloudRain, CheckSquare, Pipette, Crosshair, Cpu } from 'lucide-react';
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
                  newN = Math.max(20, Math.min(140, Math.round(nLayer.depths[0].values.mean / 20))); 
                }
              }
            } else {
              throw new Error("SoilGrids unavaliable");
            }
          } catch(e) {
            console.warn('SoilGrids API failed, using base default soil stats. Moving on with just Weather Data.', e);
          }

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
    <div className="min-h-screen bg-transparent p-6 md:p-12 relative overflow-hidden flex flex-col items-center">
      <div className="w-full max-w-4xl relative z-10">
        <header className="mb-12 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center justify-center p-3 bg-zinc-900/50 backdrop-blur-md rounded-xl border border-white/10 mb-4">
              <Cpu className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
              FARM<span className="text-emerald-500 font-light">/PARAMETERS</span>
            </h1>
            <p className="text-zinc-400 max-w-lg mx-auto leading-relaxed text-sm md:text-base font-medium">
              Input environmental parameters to initialize the prediction matrix and generate optimized configuration strategies.
            </p>
          </motion.div>
        </header>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit} 
          className="bg-zinc-900/40 backdrop-blur-2xl p-8 md:p-10 rounded-[2rem] border border-white/10 shadow-2xl relative"
        >
          {/* Subtle grid pattern background for the form */}
          <div className="absolute inset-0 rounded-[2rem] opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          <h2 className="text-sm tracking-[0.2em] uppercase font-bold mb-8 flex items-center gap-3 text-white border-b border-white/10 pb-4 relative z-10">
            <Hexagon className="w-4 h-4 text-emerald-500" /> 
            Environment Variables
          </h2>
          
          <div className="space-y-6 relative z-10">
            {/* Auto Detect Card */}
            <div className="bg-zinc-950/80 p-5 rounded-2xl border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-emerald-900/10">
              <div className="text-sm text-zinc-300">
                <span className="font-bold text-white block mb-1 flex items-center gap-2"><Crosshair className="w-4 h-4 text-emerald-400"/> GPS Tying Enabled</span>
                Sync local weather and soil diagnostics via satellite.
              </div>
              <button
                type="button"
                onClick={detectWeather}
                disabled={weatherLoading}
                className="whitespace-nowrap bg-emerald-500/10 text-emerald-400 font-bold px-5 py-2.5 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/20 hover:text-emerald-300 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {weatherLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
                    SYNCING...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" /> INITIATE SCAN
                  </>
                )}
              </button>
            </div>

            {weatherError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl border border-red-500/20 text-sm flex items-start gap-3"
              >
                <span className="mt-0.5">⚠️</span>
                <div>
                  <b className="block font-bold">Sync Failure</b>
                  <p className="opacity-80">{weatherError}</p>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">Area Scope (Acres)</label>
                <input 
                  type="number" 
                  value={formData.acres}
                  onChange={e => setFormData({...formData, acres: Number(e.target.value)})}
                  className="w-full p-4 bg-zinc-950/50 rounded-xl border border-white/5 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-zinc-100 font-mono text-sm"
                />
              </div>
              
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold flex items-center gap-1.5">
                  <Pipette className="w-3 h-3" /> Soil pH Level
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  value={formData.soilPh}
                  onChange={e => setFormData({...formData, soilPh: Number(e.target.value)})}
                  className="w-full p-4 bg-zinc-950/50 rounded-xl border border-white/5 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-zinc-100 font-mono text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> Soil Classification
                </label>
                <div className="relative">
                  <select 
                    value={formData.soilType}
                    onChange={e => setFormData({...formData, soilType: e.target.value})}
                    className="w-full p-4 bg-zinc-950/50 rounded-xl border border-white/5 appearance-none outline-none text-zinc-100 font-mono text-sm focus:border-emerald-500/50"
                  >
                    <option value="Black">BLACK_SOIL</option>
                    <option value="Red">RED_SOIL</option>
                    <option value="Alluvial">ALLUVIAL_SOIL</option>
                    <option value="Sandy">SANDY_SOIL</option>
                  </select>
                  <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold flex items-center gap-1.5">
                  <CloudRain className="w-3 h-3" /> Precipitation (mm)
                </label>
                <input 
                  type="number" 
                  value={formData.rainfall}
                  onChange={e => setFormData({...formData, rainfall: Number(e.target.value)})}
                  className="w-full p-4 bg-zinc-950/50 rounded-xl border border-white/5 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-zinc-100 font-mono text-sm"
                />
              </div>
            </div>

            {/* NPK Data */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-zinc-950/30 rounded-2xl border border-white/5">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-emerald-500/70 mb-2 font-bold">N (Nitrogen)</label>
                <input 
                  type="number" 
                  value={formData.N}
                  onChange={e => setFormData({...formData, N: Number(e.target.value)})}
                  className="w-full p-3 bg-zinc-900 rounded-lg border border-white/5 focus:border-emerald-500/50 transition-all outline-none text-zinc-100 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-emerald-500/70 mb-2 font-bold">P (Phosphorus)</label>
                <input 
                  type="number" 
                  value={formData.P}
                  onChange={e => setFormData({...formData, P: Number(e.target.value)})}
                  className="w-full p-3 bg-zinc-900 rounded-lg border border-white/5 focus:border-emerald-500/50 transition-all outline-none text-zinc-100 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-emerald-500/70 mb-2 font-bold">K (Potassium)</label>
                <input 
                  type="number" 
                  value={formData.K}
                  onChange={e => setFormData({...formData, K: Number(e.target.value)})}
                  className="w-full p-3 bg-zinc-900 rounded-lg border border-white/5 focus:border-emerald-500/50 transition-all outline-none text-zinc-100 font-mono text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold flex items-center gap-1.5">
                  <ThermometerSun className="w-3 h-3" /> Core Temp (°C)
                </label>
                <input 
                  type="number" step="0.1"
                  value={formData.temperature}
                  onChange={e => setFormData({...formData, temperature: Number(e.target.value)})}
                  className="w-full p-4 bg-zinc-950/50 rounded-xl border border-white/5 focus:border-emerald-500/50 transition-all outline-none text-zinc-100 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold flex items-center gap-1.5">
                  <Droplets className="w-3 h-3" /> Humidity (%)
                </label>
                <input 
                  type="number" step="0.1"
                  value={formData.humidity}
                  onChange={e => setFormData({...formData, humidity: Number(e.target.value)})}
                  className="w-full p-4 bg-zinc-950/50 rounded-xl border border-white/5 focus:border-emerald-500/50 transition-all outline-none text-zinc-100 font-mono text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold flex items-center gap-1.5">
                  <Droplets className="w-3 h-3" /> Water Table Level
                </label>
                <div className="relative">
                  <select 
                    value={formData.waterLevel}
                    onChange={e => setFormData({...formData, waterLevel: e.target.value as any})}
                    className="w-full p-4 bg-zinc-950/50 rounded-xl border border-white/5 appearance-none outline-none text-zinc-100 font-mono text-sm focus:border-emerald-500/50"
                  >
                    <option value="Low">LVL_01 (LOW)</option>
                    <option value="Medium">LVL_02 (MID)</option>
                    <option value="High">LVL_03 (HIGH)</option>
                  </select>
                  <Droplets className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold flex items-center gap-1.5">
                  <CheckSquare className="w-3 h-3" /> Active Irrigation
                </label>
                <div className="relative">
                  <select 
                    value={formData.irrigationAvailability ? 'Yes' : 'No'}
                    onChange={e => setFormData({...formData, irrigationAvailability: e.target.value === 'Yes'})}
                    className="w-full p-4 bg-zinc-950/50 rounded-xl border border-white/5 appearance-none outline-none text-zinc-100 font-mono text-sm focus:border-emerald-500/50"
                  >
                    <option value="Yes">STATUS_ONLINE</option>
                    <option value="No">STATUS_OFFLINE</option>
                  </select>
                  <CheckSquare className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold flex items-center gap-1.5">
                  <ThermometerSun className="w-3 h-3" /> Cycle Phase
                </label>
                <div className="relative">
                  <select 
                    value={formData.season}
                    onChange={e => setFormData({...formData, season: e.target.value as any})}
                    className="w-full p-4 bg-zinc-950/50 rounded-xl border border-white/5 appearance-none outline-none text-zinc-100 font-mono text-sm focus:border-emerald-500/50"
                  >
                    <option value="Kharif">PHASE_A (KHARIF)</option>
                    <option value="Rabi">PHASE_B (RABI)</option>
                  </select>
                  <ThermometerSun className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 relative z-10">
            <button 
              type="submit"
              disabled={loading}
              className="group w-full relative overflow-hidden rounded-xl p-[1px]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-xl opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-full bg-zinc-950 rounded-xl py-4 px-8 flex items-center justify-center gap-3 transition-all duration-300 group-hover:bg-zinc-900/50">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
                    <span className="font-bold tracking-widest text-white text-sm">COMPUTING MATRIX...</span>
                  </>
                ) : (
                  <span className="font-bold tracking-widest text-white text-sm">EXECUTE PREDICTION MODEL</span>
                )}
              </div>
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};
