import React, { useMemo, useState } from 'react';
import { Strategy, RecommendationRequest } from '../../types';
import { Hexagon, Droplets, Sprout, TrendingUp, Info } from 'lucide-react';

interface Farm2DMapProps {
  strategy: Strategy;
  request: RecommendationRequest;
}

const CROP_COLORS: Record<string, { main: string; light: string; text: string; bg: string }> = {
  rice:       { main: '#10b981', light: '#a7f3d0', text: '#065f46', bg: 'bg-emerald-500/10' },
  wheat:      { main: '#fbbf24', light: '#fde68a', text: '#78350f', bg: 'bg-amber-500/10' },
  maize:      { main: '#84cc16', light: '#d9f99d', text: '#3f6212', bg: 'bg-lime-500/10' },
  cotton:     { main: '#e2e8f0', light: '#f1f5f9', text: '#334155', bg: 'bg-slate-500/10' },
  sugarcane:  { main: '#059669', light: '#6ee7b7', text: '#064e3b', bg: 'bg-emerald-600/10' },
  jute:       { main: '#65a30d', light: '#bef264', text: '#365314', bg: 'bg-lime-600/10' },
  mustard:    { main: '#eab308', light: '#fef08a', text: '#713f12', bg: 'bg-yellow-500/10' },
  lentil:     { main: '#d97706', light: '#fde68a', text: '#78350f', bg: 'bg-amber-600/10' },
  chickpea:   { main: '#b45309', light: '#fed7aa', text: '#7c2d12', bg: 'bg-orange-600/10' },
  millet:     { main: '#ca8a04', light: '#fef08a', text: '#713f12', bg: 'bg-yellow-600/10' },
  sorghum:    { main: '#a16207', light: '#fef08a', text: '#713f12', bg: 'bg-yellow-700/10' },
  groundnut:  { main: '#c2410c', light: '#ffedd5', text: '#7c2d12', bg: 'bg-orange-500/10' },
  soybean:    { main: '#15803d', light: '#bbf7d0', text: '#14532d', bg: 'bg-green-600/10' },
  potato:     { main: '#78716c', light: '#e7e5e4', text: '#292524', bg: 'bg-stone-500/10' },
  tomato:     { main: '#ef4444', light: '#fca5a5', text: '#7f1d1d', bg: 'bg-red-500/10' },
};

const DEFAULT_COLOR = { main: '#10b981', light: '#a7f3d0', text: '#065f46', bg: 'bg-emerald-500/10' };

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
    <div className="flex flex-col gap-6 w-full bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-6 md:p-8 backdrop-blur-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-[0.2em] flex items-center gap-1.5 mb-1">
            <Hexagon className="w-3.5 h-3.5" /> 2D Schematic Simulation
          </span>
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">Spatial Layout Map</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(strategy.landDistribution).map(([crop, area]) => {
            const color = getCropColors(crop);
            return (
              <div 
                key={crop}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 transition-all text-xs font-semibold ${
                  hoveredCrop === crop ? 'bg-zinc-800 border-white/10 scale-105' : 'bg-zinc-950/40'
                }`}
                onMouseEnter={() => setHoveredCrop(crop)}
                onMouseLeave={() => setHoveredCrop(null)}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.main }} />
                <span className="text-zinc-300 uppercase">{crop}</span>
                <span className="text-zinc-500 font-mono text-[10px]">({area} AC)</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative w-full aspect-[1.5/1] rounded-[1.8rem] overflow-hidden bg-zinc-950/60 border border-white/10 p-2 shadow-2xl">
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
                  <circle cx="2" cy="2" r="0.75" fill={color.main} opacity="0.45" />
                </pattern>
              );
            })}
          </defs>

          {/* Grid reference background */}
          <rect width="100" height="65" fill="#080808" />
          <path d="M 0 0 L 100 0 L 100 65 L 0 65 Z" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          
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
                  fill={color.main}
                  opacity={isHovered ? 0.35 : isAnyHovered ? 0.12 : 0.22}
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
                  opacity={isHovered ? 1.0 : isAnyHovered ? 0.4 : 0.75}
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
                  opacity={isHovered ? 1.0 : isAnyHovered ? 0.2 : 0.5}
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
                        className="text-[3px] md:text-[2.2px] font-black uppercase tracking-widest transition-all duration-300"
                        style={{ color: isHovered ? '#ffffff' : color.main }}
                      >
                        {zone.cropName}
                      </span>
                      <span className="text-[2px] text-zinc-500 font-mono mt-0.5 font-bold">
                        {zone.area} AC
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
      <div className="bg-zinc-950/60 rounded-2xl p-5 border border-white/5 min-h-[90px] flex items-center justify-center">
        {hoveredCrop ? (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full items-center">
            <div className="flex items-center gap-3 col-span-1">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10"
                style={{ backgroundColor: getCropColors(hoveredCrop).main + '1a', borderColor: getCropColors(hoveredCrop).main + '33' }}
              >
                <Sprout className="w-5 h-5" style={{ color: getCropColors(hoveredCrop).main }} />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm uppercase tracking-wide">{hoveredCrop}</h4>
                <p className="text-[10px] text-zinc-500 font-mono">
                  {strategy.landDistribution[hoveredCrop]} Acres Footprint
                </p>
              </div>
            </div>
            
            <div className="bg-zinc-900/40 rounded-xl p-3 border border-white/5 flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Predicted Yield</div>
                <div className="text-xs font-bold text-white font-mono">{strategy.predictedYield[hoveredCrop]?.toLocaleString() || 0} KG</div>
              </div>
            </div>

            <div className="bg-zinc-900/40 rounded-xl p-3 border border-white/5 flex items-center gap-3">
              <Droplets className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Water Requirement</div>
                <div className="text-xs font-bold text-white font-mono">{strategy.waterRequirementPerCrop[hoveredCrop] || 0} MM</div>
              </div>
            </div>

            <div className="bg-zinc-900/40 rounded-xl p-3 border border-white/5 flex items-center gap-3">
              <Info className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Symbiotic Role</div>
                <div className="text-xs font-bold text-white truncate max-w-[140px] font-sans">
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
          <p className="text-xs text-zinc-500 text-center font-mono flex items-center gap-2">
            <Info className="w-4 h-4 text-zinc-600 animate-pulse" /> Hover over any crop block or label in the schematic map above to inspect detailed parameters.
          </p>
        )}
      </div>
    </div>
  );
};
