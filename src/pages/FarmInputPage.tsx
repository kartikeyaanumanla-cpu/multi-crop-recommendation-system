import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SuggestionRequest } from '../types';
import { Hexagon, MapPin, Droplets, ThermometerSun, CloudRain, CheckSquare, Pipette, Crosshair, Leaf, Loader2, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { suggestCrops } from '../services/api';
import { z } from 'zod';

const landSchema = z.object({
  acres: z.number().min(0.1, "Must be at least 0.1").max(10000, "Too large"),
  season: z.enum(['Kharif', 'Rabi']),
});

const soilSchema = z.object({
  soilType: z.string().min(1, "Required"),
  soilPh: z.number().min(0).max(14).optional(),
});

const climateSchema = z.object({
  temperature: z.number().min(-20, "Too low").max(60, "Value exceeds realistic limits"),
  humidity: z.number().min(0, "Must be positive").max(100, "Max 100%"),
  rainfall: z.number().min(0, "Must be positive").max(10000, "Value exceeds realistic limits"),
  waterLevel: z.enum(['Low', 'Medium', 'High']),
  irrigationAvailability: z.boolean(),
});

const farmSchema = landSchema.merge(soilSchema).merge(climateSchema);

export const FarmInputPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherDetected, setWeatherDetected] = useState(false);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fertilizerHistory, setFertilizerHistory] = useState('Moderate');
  const [previousCrop, setPreviousCrop] = useState('None');
  const [rainfallCategory, setRainfallCategory] = useState('Moderate');

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
          setWeatherDetected(true);
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

  const validateStep = (step: number): boolean => {
    let schema;
    if (step === 1) schema = landSchema;
    else if (step === 2) schema = soilSchema;
    else schema = climateSchema;

    const result = schema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        newErrors[issue.path[0]] = issue.message;
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const generateFuzzyNPK = (history: string, prevCrop: string, soilType: string) => {
    let minN, maxN, minP, maxP, minK, maxK;
    switch (history) {
      case 'Heavy':
        minN = 80; maxN = 120; minP = 40; maxP = 60; minK = 40; maxK = 60;
        break;
      case 'Low':
        minN = 20; maxN = 40; minP = 10; maxP = 20; minK = 10; maxK = 20;
        break;
      case 'None':
        minN = 5; maxN = 20; minP = 5; maxP = 10; minK = 5; maxK = 10;
        break;
      case 'Moderate':
      default:
        minN = 40; maxN = 80; minP = 20; maxP = 40; minK = 20; maxK = 40;
        break;
    }
    
    if (prevCrop === 'Legumes') {
      minN += 20; maxN += 30;
    } else if (prevCrop === 'Cereals') {
      minN = Math.max(0, minN - 15); maxN = Math.max(10, maxN - 15);
    }

    let basePh = 6.5;
    if (soilType === 'Black') basePh = 7.5;
    if (soilType === 'Red') basePh = 5.5;
    if (soilType === 'Sandy') basePh = 6.0;
    if (soilType === 'Alluvial') basePh = 7.0;
    
    return {
      N: Math.floor(Math.random() * (maxN - minN + 1)) + minN,
      P: Math.floor(Math.random() * (maxP - minP + 1)) + minP,
      K: Math.floor(Math.random() * (maxK - minK + 1)) + minK,
      estimatedPh: Number((basePh + (Math.random() * 0.4 - 0.2)).toFixed(1))
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    const fullResult = farmSchema.safeParse(formData);
    if (!fullResult.success) {
       return; // Sanity check
    }

    setLoading(true);

    try {
      const fuzzyNPK = generateFuzzyNPK(fertilizerHistory, previousCrop, formData.soilType);
      
      let finalTemp = formData.temperature;
      let finalHum = formData.humidity;
      if (!weatherDetected) {
         if (formData.season === 'Kharif') {
             finalTemp = 28.5 + (Math.random() * 2 - 1);
             finalHum = 80.0 + (Math.random() * 5 - 2.5);
         } else {
             finalTemp = 18.5 + (Math.random() * 3 - 1.5);
             finalHum = 45.0 + (Math.random() * 5 - 2.5);
         }
      }

      let finalRainfall = formData.rainfall;
      if (rainfallCategory === 'Heavy') finalRainfall = 1800 + (Math.random() * 400 - 200);
      else if (rainfallCategory === 'Low') finalRainfall = 400 + (Math.random() * 200 - 100);
      else finalRainfall = 1000 + (Math.random() * 400 - 200);

      const finalRequestData = {
        ...formData,
        ...fuzzyNPK,
        soilPh: formData.soilPh === 6.5 ? fuzzyNPK.estimatedPh : formData.soilPh,
        temperature: Number(finalTemp.toFixed(1)),
        humidity: Number(finalHum.toFixed(1)),
        rainfall: Number(finalRainfall.toFixed(1))
      };
      
      const response = await suggestCrops(finalRequestData);
      navigate('/dashboard/select-crop', { state: { requestData: finalRequestData, suggestionData: response } });
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'An unexpected error occurred while fetching crop suggestions.');
    } finally {
      setLoading(false);
    }
  };

  const renderError = (field: string) => {
    if (!errors[field]) return null;
    return <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors[field]}</p>;
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center overflow-hidden">
      <div className="w-full max-w-3xl relative z-10">
        <header className="mb-8 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-2xl mb-4 text-emerald-600 shadow-sm border border-emerald-200">
              <Leaf className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 mb-4">
              AI Farm Planner Setup
            </h1>
            <p className="text-slate-500 max-w-lg mx-auto text-base">
              Enter your farm's details to get personalized, AI-driven crop recommendations.
            </p>
          </motion.div>
        </header>

        {/* Step Indicator */}
        <div className="flex justify-center items-center mb-8 gap-3">
          {[1, 2, 3].map(step => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                currentStep === step ? 'bg-emerald-600 text-white shadow-md' :
                currentStep > step ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-1 mx-2 rounded-full transition-colors duration-300 ${
                  currentStep > step ? 'bg-emerald-200' : 'bg-slate-100'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white p-6 md:p-10 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative min-h-[450px] flex flex-col">
          <AnimatePresence mode="wait" custom={1}>
            
            {/* STEP 1: Land Information */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2">
                  <Hexagon className="w-6 h-6 text-emerald-500" /> 
                  Farm Details & Season
                </h2>

                <div className="space-y-6">
                  <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600"/> Auto-Detect Location Data
                      </span>
                      Save time by letting us pull real-time weather and soil data based on your location.
                    </div>
                    <button
                      type="button"
                      onClick={detectWeather}
                      disabled={weatherLoading}
                      className="whitespace-nowrap bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-sm text-sm"
                    >
                      {weatherLoading ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Detecting...</>
                      ) : (
                        <><Crosshair className="w-4 h-4" /> Use My Location</>
                      )}
                    </button>
                  </div>
                  
                  {weatherError && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 text-sm flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div><b className="block font-semibold">Could not fetch location data</b><p className="mt-1 opacity-90">{weatherError}</p></div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Farm Size (Acres)</label>
                      <input 
                        type="number" step="0.1" min="0.1" max="10000"
                        value={formData.acres}
                        onChange={e => setFormData({...formData, acres: Math.abs(parseFloat(e.target.value) || 0)})}
                        className={`w-full p-3.5 bg-slate-50 rounded-xl border ${errors.acres ? 'border-red-300 focus:ring-red-500/10' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'} focus:ring-4 transition-all outline-none text-slate-800 font-medium`}
                      />
                      {renderError('acres')}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Season</label>
                      <select 
                        value={formData.season}
                        onChange={e => setFormData({...formData, season: e.target.value as any})}
                        className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 outline-none text-slate-800 font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      >
                        <option value="Kharif">Kharif (Monsoon)</option>
                        <option value="Rabi">Rabi (Winter)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Soil Health */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2">
                  <Pipette className="w-6 h-6 text-amber-600" /> 
                  Soil & Agronomy Facts
                </h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Soil Type</label>
                      <select 
                        value={formData.soilType}
                        onChange={e => setFormData({...formData, soilType: e.target.value})}
                        className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 outline-none text-slate-800 font-medium focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                      >
                        <option value="Black">Black Soil</option>
                        <option value="Red">Red Soil</option>
                        <option value="Alluvial">Alluvial Soil</option>
                        <option value="Sandy">Sandy Soil</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Previous Crop Grown</label>
                      <select 
                        value={previousCrop}
                        onChange={e => setPreviousCrop(e.target.value)}
                        className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 outline-none text-slate-800 font-medium focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                      >
                        <option value="None">None / Fallow</option>
                        <option value="Legumes">Legumes (Beans, Peas, Dal) - Fixes Nitrogen</option>
                        <option value="Cereals">Cereals (Wheat, Rice, Maize)</option>
                        <option value="Vegetables">Vegetables / Roots</option>
                      </select>
                    </div>
                  </div>

                  {/* Fertilizer History */}
                  <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100">
                    <label className="block text-sm font-semibold text-amber-800 mb-2">Fertilizer Usage History</label>
                    <div className="text-xs text-amber-700/80 mb-3">Select your historical fertilizer usage to allow the AI to estimate baseline soil nutrient profiles (NPK).</div>
                    <select 
                      value={fertilizerHistory}
                      onChange={e => setFertilizerHistory(e.target.value)}
                      className="w-full p-3.5 bg-white rounded-xl border border-amber-200 outline-none text-slate-800 font-medium focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                    >
                      <option value="Heavy">Heavy (Frequent chemical fertilizers)</option>
                      <option value="Moderate">Moderate (Standard usage)</option>
                      <option value="Low">Low (Minimal usage)</option>
                      <option value="None">None / Organic (No synthetic fertilizers)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Climate & Water */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2">
                  <CloudRain className="w-6 h-6 text-blue-500" /> 
                  Climate & Irrigation
                </h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Expected Rainfall</label>
                      <select 
                        value={rainfallCategory}
                        onChange={e => setRainfallCategory(e.target.value)}
                        className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 outline-none text-slate-800 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      >
                        <option value="Heavy">Heavy (Coastal / Monsoon)</option>
                        <option value="Moderate">Moderate (Average / Plains)</option>
                        <option value="Low">Low (Arid / Dry)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Water Level</label>
                      <select 
                        value={formData.waterLevel}
                        onChange={e => setFormData({...formData, waterLevel: e.target.value as any})}
                        className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 outline-none text-slate-800 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Irrigation Access</label>
                      <select 
                        value={formData.irrigationAvailability ? 'Yes' : 'No'}
                        onChange={e => setFormData({...formData, irrigationAvailability: e.target.value === 'Yes'})}
                        className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 outline-none text-slate-800 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      >
                        <option value="Yes">Yes, Available</option>
                        <option value="No">No / Rain-fed</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-auto pt-8 flex items-center justify-between border-t border-slate-100">
            {currentStep > 1 ? (
              <button 
                type="button" 
                onClick={handleBack}
                className="text-slate-500 hover:text-slate-800 font-semibold px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
            ) : (
              <div /> // Placeholder for spacing
            )}

            {currentStep < 3 ? (
              <button 
                type="button" 
                onClick={handleNext}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                Next <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-70 disabled:hover:bg-emerald-600 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
                ) : (
                  <>Get Recommendations <Leaf className="w-5 h-5" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
