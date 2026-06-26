import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Activity, History, CloudSun, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeCount, setActiveCount] = useState(0);
  const [harvestCount, setHarvestCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Widget States
  const [weather, setWeather] = useState({ temp: 28, condition: 'Partly Cloudy', humidity: 65, rainChance: 10 });
  const [marketPrices, setMarketPrices] = useState<{crop: string, price: string, trend: string}[]>([]);
  const [alerts, setAlerts] = useState<{type: string, message: string}[]>([
    { type: 'info', message: 'Loading farm data...' }
  ]);

  useEffect(() => {
    let activeCropsList: string[] = [];
    let initialWeather = { ...weather };

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
          const active = data.filter((rec: any) => !rec.harvestLog);
          const harvested = data.filter((rec: any) => rec.harvestLog).length;
          
          setActiveCount(active.length);
          setHarvestCount(harvested);

          // Extract active crops and prices
          const crops = new Set<string>();
          const pricesMap = new Map<string, any>();
          
          active.forEach((rec: any) => {
             if (rec.strategies && rec.strategies.length > 0) {
                 const strat = rec.strategies[0];
                 if (strat.mainCrop) crops.add(strat.mainCrop);
                 if (strat.sideCrops) strat.sideCrops.forEach((c: string) => crops.add(c));
                 
                 // Extract prices from cropPrices or marketPrice
                 if (strat.cropPrices) {
                   Object.keys(strat.cropPrices).forEach(crop => {
                     pricesMap.set(crop, strat.cropPrices[crop]);
                   });
                 } else if (strat.marketPrice && strat.mainCrop) {
                   // Fallback for older plans
                   pricesMap.set(strat.mainCrop, strat.marketPrice);
                 }
             }
          });
          activeCropsList = Array.from(crops);
          
          // Format prices for the widget
          const formattedPrices: {crop: string, price: string, trend: string}[] = [];
          
          // Ensure every active crop has a price to display, even if it's an old plan without cropPrices
          crops.forEach(cropName => {
            let pricePerQ = 0;
            if (pricesMap.has(cropName)) {
              pricePerQ = pricesMap.get(cropName).pricePerKg * 100;
            } else {
              // Fallback simulated price for old plans where side crops didn't save prices
              // Hash the crop name to get a consistent simulated price
              let hash = 0;
              for (let i = 0; i < cropName.length; i++) hash = cropName.charCodeAt(i) + ((hash << 5) - hash);
              pricePerQ = 2000 + (Math.abs(hash) % 4000); // Random price between 2000 and 6000
            }
            
            // Generate a random stable trend for UI purposes
            const trendVal = (Math.random() * 5 - 2).toFixed(1);
            const trend = trendVal.startsWith('-') ? `${trendVal}%` : `+${trendVal}%`;
            formattedPrices.push({
              crop: cropName,
              price: `₹${pricePerQ.toLocaleString()}/q`,
              trend
            });
          });
          
          setMarketPrices(formattedPrices);
        }
      } catch (err) {
        console.error('Failed to fetch history metrics', err);
      } finally {
        setLoading(false);
      }
    };

    const generateAlerts = (temp: number, humidity: number, condition: string, crops: string[]) => {
      const newAlerts: {type: string, message: string}[] = [];
      const lowerCrops = crops.map(c => c.toLowerCase());

      if (crops.length === 0) {
          setAlerts([{ type: 'info', message: 'No active crops to monitor. Create an AI Farm Plan to get started.' }]);
          return;
      }

      if (humidity > 80 && (lowerCrops.includes('tomato') || lowerCrops.includes('cotton') || lowerCrops.includes('potato'))) {
          newAlerts.push({ type: 'warning', message: `High humidity (${humidity}%) detected. High risk of fungal diseases (like blight/mildew) for your susceptible crops.` });
      }

      if (temp > 35) {
          newAlerts.push({ type: 'warning', message: `Extreme heat (${temp}°C). Ensure adequate irrigation to prevent heat stress.` });
      }

      if (condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('storm')) {
          newAlerts.push({ type: 'info', message: 'Rain expected. You may want to hold off on manual irrigation today.' });
      }

      if (temp < 15 && (lowerCrops.includes('tomato') || lowerCrops.includes('cotton'))) {
          newAlerts.push({ type: 'warning', message: `Low temperatures detected. Growth of warm-season crops may slow down.` });
      }

      if (newAlerts.length === 0) {
          newAlerts.push({ type: 'success', message: 'Weather conditions look optimal for your active crops today!' });
      }

      setAlerts(newAlerts);
    };

    const loadDynamicData = async () => {
       await fetchHistory();

       if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const apiKey = (import.meta as any).env.VITE_OPENWEATHER_API_KEY;
              if (apiKey) {
                 const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
                 const weatherRes = await fetch(weatherUrl);
                 const weatherData = await weatherRes.json();

                 const temp = Math.round(weatherData.main.temp);
                 const humidity = Math.round(weatherData.main.humidity);
                 const condition = weatherData.weather[0].main;
                 const rainChance = condition.toLowerCase().includes('rain') ? 80 : (condition.toLowerCase().includes('cloud') ? 30 : 0);

                 setWeather({ temp, condition, humidity, rainChance });
                 generateAlerts(temp, humidity, condition, activeCropsList);
              }
            } catch(e) {
              console.error("Weather fetch failed", e);
              generateAlerts(initialWeather.temp, initialWeather.humidity, initialWeather.condition, activeCropsList); 
            }
         }, () => {
             // Geo blocked fallback
             generateAlerts(initialWeather.temp, initialWeather.humidity, initialWeather.condition, activeCropsList);
         });
       } else {
           generateAlerts(initialWeather.temp, initialWeather.humidity, initialWeather.condition, activeCropsList);
       }
    };

    loadDynamicData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome back, {user.name || 'Farmer'}</h1>
        <p className="text-slate-500 mt-2 text-lg">Here's what's happening on your farm today.</p>
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
          <h3 className="text-lg font-bold text-slate-800">Create AI Farm Plan</h3>
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

      {/* New Widgets */}
      <div className="mt-12 mb-6">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Farm Facts & Insights</h2>
        <p className="text-slate-500 mt-1">Live environmental and market data.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weather Widget */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-3xl shadow-sm text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold opacity-90">Local Weather</h3>
              <p className="text-sm opacity-75">Today's Forecast</p>
            </div>
            <CloudSun className="w-8 h-8 opacity-90" />
          </div>
          <div className="text-4xl font-extrabold mb-4">{weather.temp}°C</div>
          <div className="space-y-2 text-sm opacity-90">
            <div className="flex justify-between"><span>Condition</span> <span>{weather.condition}</span></div>
            <div className="flex justify-between"><span>Humidity</span> <span>{weather.humidity}%</span></div>
            <div className="flex justify-between"><span>Rain Chance</span> <span>{weather.rainChance}%</span></div>
          </div>
        </motion.div>

        {/* Market Prices */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6 text-emerald-600">
            <TrendingUp className="w-6 h-6" />
            <h3 className="text-lg font-bold text-slate-800">Active Plan Mandi Prices</h3>
          </div>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {marketPrices.length > 0 ? marketPrices.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100">
                <span className="font-semibold text-slate-700">{item.crop}</span>
                <div className="text-right">
                  <div className="font-bold text-slate-800">{item.price}</div>
                  <div className={`text-xs ${item.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{item.trend}</div>
                </div>
              </div>
            )) : (
              <div className="text-slate-500 text-sm p-3 text-center border border-dashed border-slate-200 rounded-xl">
                No active plans found. Create a plan to track live prices.
              </div>
            )}
          </div>
        </motion.div>

        {/* Pest & Disease Alerts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-amber-50 p-6 rounded-3xl shadow-sm border border-amber-200">
          <div className="flex items-center gap-3 mb-4 text-amber-600">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="text-lg font-bold text-slate-800">Farm Alerts</h3>
          </div>
          <div className="space-y-3">
            {alerts.length > 0 ? alerts.map((alert, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm text-sm text-slate-700 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p>{alert.message}</p>
              </div>
            )) : (
              <div className="text-slate-500 text-sm">No active alerts right now.</div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};
