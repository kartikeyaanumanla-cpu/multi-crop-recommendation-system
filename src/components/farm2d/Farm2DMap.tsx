import React, { useMemo, useState } from 'react';
import { Strategy, RecommendationRequest } from '../../types';
import { Map as MapIcon, Droplets, Sprout, TrendingUp, Info } from 'lucide-react';

interface Farm2DMapProps {
  strategy: Strategy;
  request: RecommendationRequest;
}

const CROP_COLORS: Record<string, { main: string; light: string; text: string; bg: string }> = {
  rice:       { main: '#10b981', light: '#d1fae5', text: '#047857', bg: 'bg-emerald-50' },
  wheat:      { main: '#f59e0b', light: '#fef3c7', text: '#b45309', bg: 'bg-amber-50' },
  maize:      { main: '#84cc16', light: '#ecfccb', text: '#4d7c0f', bg: 'bg-lime-50' },
  cotton:     { main: '#0ea5e9', light: '#e0f2fe', text: '#0369a1', bg: 'bg-sky-50' },
  sugarcane:  { main: '#059669', light: '#d1fae5', text: '#047857', bg: 'bg-emerald-50' },
  jute:       { main: '#65a30d', light: '#ecfccb', text: '#3f6212', bg: 'bg-lime-50' },
  mustard:    { main: '#eab308', light: '#fef08a', text: '#a16207', bg: 'bg-yellow-50' },
  lentil:     { main: '#ef4444', light: '#fee2e2', text: '#b91c1c', bg: 'bg-red-50' },
  chickpea:   { main: '#f97316', light: '#ffedd5', text: '#c2410c', bg: 'bg-orange-50' },
  millet:     { main: '#d97706', light: '#fef3c7', text: '#92400e', bg: 'bg-amber-50' },
  sorghum:    { main: '#c2410c', light: '#ffedd5', text: '#9a3412', bg: 'bg-orange-50' },
  groundnut:  { main: '#854d0e', light: '#fef3c7', text: '#713f12', bg: 'bg-yellow-50' },
  soybean:    { main: '#22c55e', light: '#dcfce3', text: '#15803d', bg: 'bg-green-50' },
  potato:     { main: '#78716c', light: '#f5f5f4', text: '#44403c', bg: 'bg-stone-50' },
  tomato:     { main: '#dc2626', light: '#fee2e2', text: '#991b1b', bg: 'bg-red-50' },
};

const DEFAULT_COLOR = { main: '#10b981', light: '#d1fae5', text: '#047857', bg: 'bg-emerald-50' };

function getCropColors(cropName: string) {
  return CROP_COLORS[cropName.toLowerCase()] || DEFAULT_COLOR;
}

export const Farm2DMap: React.FC<Farm2DMapProps> = ({ strategy, request }) => {
  const [hoveredCrop, setHoveredCrop] = useState<string | null>(null);

  // Re-map 3D layout coordinates to a clean 2D schematic
  const { zones, totalWidth, depth } = useMemo(() => {
    const entries = Object.entries(strategy.landDistribution);
    const totalAcres = entries.reduce((sum: number, [, area]) => sum + (area as number), 0);
    
    const tw = 100; // standard width units for SVG
    const d = 65;   // standard depth units for SVG

    const layoutType = strategy.farmLayout?.layoutType?.toLowerCase() || 'block cropping';
    const z: {
      cropName: string;
      area: number;
      x: number;
      y: number;
      w: number;
      h: number;
      index: number;
    }[] = [];

    const addZone = (crop: string, a: number, x: number, y: number, w: number, h: number, idx: number) => {
      z.push({ cropName: crop, area: a, x, y, w, h, index: idx });
    };

    if (layoutType.includes('block')) {
      if (entries.length === 3) {
        const [main, c1, c2] = entries;
        const mArea = main[1] as number;
        const c1Area = c1[1] as number;
        const c2Area = c2[1] as number;
        
        const mProp = mArea / totalAcres;
        const mWidth = tw * mProp;
        
        // Main crop left half
        addZone(main[0], mArea, 0, 0, mWidth, d, 0);
        
        // Side crops split the right half based on relative size
        const rightWidth = tw - mWidth;
        const c1Prop = c1Area / (c1Area + c2Area);
        const c1Height = d * c1Prop;
        
        addZone(c1[0], c1Area, mWidth, 0, rightWidth, c1Height, 1);
        addZone(c2[0], c2Area, mWidth, c1Height, rightWidth, d - c1Height, 2);
      } else {
        let curX = 0;
        entries.forEach(([crop, area], i) => {
          const w = tw * ((area as number) / totalAcres);
          addZone(crop, area as number, curX, 0, w, d, i);
          curX += w;
        });
      }
    } else if (layoutType.includes('strip')) {
      const slices = 3;
      let curY = 0;
      const stripHeight = d / (slices * entries.length);
      for (let s = 0; s < slices; s++) {
        entries.forEach(([crop, area], i) => {
          addZone(crop, area as number, 0, curY, tw, stripHeight, i * 10 + s);
          curY += stripHeight;
        });
      }
    } else {
      // Intercropping alternate vertical rows
      const slices = 8;
      let curX = 0;
      const rowWidth = tw / (slices * entries.length);
      for (let s = 0; s < slices; s++) {
        entries.forEach(([crop, area], i) => {
          addZone(crop, area as number, curX, 0, rowWidth, d, i * 10 + s);
          curX += rowWidth;
        });
      }
    }

    return { zones: z, totalWidth: tw, depth: d };
  }, [strategy]);

  return (
    <div className="flex flex-col gap-6 w-full bg-white border border-slate-200 rounded-[2.5rem] p-6 md:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <MapIcon className="w-4 h-4" /> 2D Map View
          </span>
          <h3 className="text-lg font-bold text-slate-800 tracking-wide">Spatial Layout</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(strategy.landDistribution).map(([crop, area]) => {
            const color = getCropColors(crop);
            return (
              <div 
                key={crop}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold ${
                  hoveredCrop === crop ? 'bg-slate-100 border-slate-300 shadow-sm scale-105' : 'bg-slate-50 border-slate-200'
                }`}
                onMouseEnter={() => setHoveredCrop(crop)}
                onMouseLeave={() => setHoveredCrop(null)}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.main }} />
                <span className="text-slate-700 capitalize">{crop}</span>
                <span className="text-slate-500 font-medium text-[10px]">({area} Ac)</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative w-full aspect-[1.5/1] rounded-[1.8rem] overflow-hidden bg-slate-50 border border-slate-200 p-2 shadow-inner">
        <svg viewBox="0 0 100 65" className="w-full h-full rounded-2xl">
          <defs>
            {/* Patterns for each crop */}
            {Object.keys(strategy.landDistribution).map(crop => {
              const color = getCropColors(crop);
              return (
                <pattern
                  key={`pattern-${crop}`}
                  id={`pattern-${crop}`}
                  width="4"
                  height="4"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2" cy="2" r="0.75" fill={color.main} opacity="0.4" />
                </pattern>
              );
            })}
          </defs>

          {/* Grid reference background */}
          <rect width="100" height="65" fill="#f8fafc" />
          <path d="M 0 0 L 100 0 L 100 65 L 0 65 Z" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
          
          {/* Layout Zones */}
          {zones.map((zone, idx) => {
            const color = getCropColors(zone.cropName);
            const isHovered = hoveredCrop === zone.cropName;
            const isAnyHovered = hoveredCrop !== null;

            return (
              <g 
                key={`zone-svg-${zone.index}-${idx}`}
                onMouseEnter={() => setHoveredCrop(zone.cropName)}
                onMouseLeave={() => setHoveredCrop(null)}
                className="cursor-pointer transition-all duration-300"
              >
                {/* Main Ground fill */}
                <rect
                  x={zone.x + 0.15}
                  y={zone.y + 0.15}
                  width={Math.max(0.1, zone.w - 0.3)}
                  height={Math.max(0.1, zone.h - 0.3)}
                  rx="0.5"
                  fill={color.light}
                  opacity={isHovered ? 0.9 : isAnyHovered ? 0.4 : 0.7}
                  className="transition-all duration-300"
                />

                {/* Pattern overlay */}
                <rect
                  x={zone.x + 0.15}
                  y={zone.y + 0.15}
                  width={Math.max(0.1, zone.w - 0.3)}
                  height={Math.max(0.1, zone.h - 0.3)}
                  rx="0.5"
                  fill={`url(#pattern-${zone.cropName})`}
                  opacity={isHovered ? 1.0 : isAnyHovered ? 0.4 : 0.8}
                  className="transition-all duration-300"
                />

                {/* Stroke Border */}
                <rect
                  x={zone.x + 0.1}
                  y={zone.y + 0.1}
                  width={Math.max(0.1, zone.w - 0.2)}
                  height={Math.max(0.1, zone.h - 0.2)}
                  rx="0.5"
                  fill="none"
                  stroke={color.main}
                  strokeWidth={isHovered ? 0.6 : 0.3}
                  opacity={isHovered ? 1.0 : isAnyHovered ? 0.3 : 0.8}
                  className="transition-all duration-300"
                />

                {/* Labels (Only render in larger zones or if hovered to prevent overlap) */}
                {((zone.w > 18 && zone.h > 15) || (isHovered && zone.w > 8)) && (
                  <foreignObject
                    x={zone.x + 1}
                    y={zone.y + (zone.h / 2) - 4}
                    width={zone.w - 2}
                    height="8"
                    className="overflow-visible pointer-events-none"
                  >
                    <div className="flex flex-col items-center justify-center text-center leading-none">
                      <span 
                        className="text-[3px] md:text-[2.2px] font-bold capitalize transition-all duration-300 px-1 py-0.5 rounded"
                        style={{ color: color.text, backgroundColor: isHovered ? 'rgba(255,255,255,0.8)' : 'transparent' }}
                      >
                        {zone.cropName}
                      </span>
                      <span className="text-[2px] text-slate-600 font-medium mt-0.5">
                        {zone.area} Acres
                      </span>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Info card of hovered/selected crop */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 min-h-[90px] flex items-center justify-center">
        {hoveredCrop ? (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full items-center">
            <div className="flex items-center gap-3 col-span-1">
              <div 
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCropColors(hoveredCrop).bg}`}
              >
                <Sprout className="w-5 h-5" style={{ color: getCropColors(hoveredCrop).main }} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm capitalize">{hoveredCrop}</h4>
                <p className="text-xs text-slate-500 font-medium">
                  {strategy.landDistribution[hoveredCrop]} Acres
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-3 border border-slate-200 flex items-center gap-3 shadow-sm">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Expected Yield</div>
                <div className="text-sm font-bold text-slate-800">{strategy.predictedYield[hoveredCrop]?.toLocaleString() || 0} kg</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 border border-slate-200 flex items-center gap-3 shadow-sm">
              <Droplets className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Water Need</div>
                <div className="text-sm font-bold text-slate-800">{strategy.waterRequirementPerCrop[hoveredCrop] || 0} mm</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 border border-slate-200 flex items-center gap-3 shadow-sm">
              <Info className="w-5 h-5 text-indigo-500" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Benefit</div>
                <div className="text-xs font-bold text-slate-800 truncate max-w-[140px] font-sans">
                  {hoveredCrop.toLowerCase().includes('bean') || hoveredCrop.toLowerCase().includes('pea') || hoveredCrop.toLowerCase().includes('gram') || hoveredCrop.toLowerCase().includes('groundnut') || hoveredCrop.toLowerCase().includes('lentil') 
                    ? 'Nitrogen Fixer (Enriches Soil)' 
                    : hoveredCrop.toLowerCase().includes('maize') || hoveredCrop.toLowerCase().includes('sugarcane') 
                    ? 'Tall Canopy (Windbreak / Shade)' 
                    : hoveredCrop.toLowerCase().includes('mustard') 
                    ? 'Pest Detrimental Border' 
                    : 'Soil Bio-aeration'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center font-medium flex items-center gap-2">
            <Info className="w-5 h-5 text-slate-400" /> Hover over a crop zone in the map above to see its details.
          </p>
        )}
      </div>
    </div>
  );
};
