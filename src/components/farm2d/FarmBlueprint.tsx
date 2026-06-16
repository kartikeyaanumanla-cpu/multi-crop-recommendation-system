import React, { useMemo, useState } from 'react';
import { Strategy, RecommendationRequest } from '../../types';
import { Compass, Ruler, Sprout } from 'lucide-react';

interface FarmBlueprintProps {
  strategy: Strategy;
  request: RecommendationRequest;
}

// Agronomic sowing database
const SOWING_METADATA: Record<string, { depth: string; spacing: string; method: string }> = {
  rice:           { depth: '2-3 cm', spacing: '20 x 15 cm', method: 'Wet Transplanting' },
  wheat:          { depth: '3-5 cm', spacing: '22.5 x 10 cm', method: 'Line Drilling' },
  maize:          { depth: '5-7 cm', spacing: '60 x 20 cm', method: 'Dibbling' },
  cotton:         { depth: '3-5 cm', spacing: '75 x 30 cm', method: 'Ridge Sowing' },
  sugarcane:      { depth: '10-12 cm', spacing: '90 x 30 cm', method: 'Furrow Planting' },
  jute:           { depth: '2-3 cm', spacing: '30 x 10 cm', method: 'Broadcasting/Drilling' },
  mustard:        { depth: '2-3 cm', spacing: '30 x 10 cm', method: 'Line Drilling' },
  lentil:         { depth: '3-4 cm', spacing: '30 x 10 cm', method: 'Drilling' },
  chickpea:       { depth: '5-8 cm', spacing: '30 x 10 cm', method: 'Deep Drilling' },
  millet:         { depth: '2-3 cm', spacing: '45 x 15 cm', method: 'Drilling/Broadcasting' },
  sorghum:        { depth: '3-4 cm', spacing: '45 x 15 cm', method: 'Line Sowing' },
  groundnut:      { depth: '5 cm', spacing: '30 x 10 cm', method: 'Dibbling' },
  soybean:        { depth: '3-5 cm', spacing: '45 x 5 cm', method: 'Line Drilling' },
  potato:         { depth: '8-10 cm', spacing: '60 x 20 cm', method: 'Ridging' },
  tomato:         { depth: '1.5 cm', spacing: '60 x 45 cm', method: 'Transplanting' },
  'green gram':   { depth: '3-4 cm', spacing: '30 x 10 cm', method: 'Line Drilling' },
  'black gram':   { depth: '3-5 cm', spacing: '30 x 10 cm', method: 'Drilling' },
  'pearl millet': { depth: '2-3 cm', spacing: '45 x 15 cm', method: 'Drilling/Broadcasting' },
  cowpea:         { depth: '3-5 cm', spacing: '30 x 15 cm', method: 'Dibbling' },
  peanut:         { depth: '5 cm', spacing: '30 x 10 cm', method: 'Dibbling' },
  sunflower:      { depth: '3-5 cm', spacing: '45 x 30 cm', method: 'Dibbling' },
};

const DEFAULT_METADATA = { depth: '3-5 cm', spacing: '30 x 15 cm', method: 'Drilling' };

function getSowingMetadata(cropName: string) {
  return SOWING_METADATA[cropName.toLowerCase()] || DEFAULT_METADATA;
}

// Colors representing actual crops in the UI (Vibrant, light-theme palette)
const CROP_THEMES: Record<string, { stroke: string; fill: string; accent: string }> = {
  rice:           { stroke: '#059669', fill: 'rgba(16,185,129,0.15)', accent: '#10b981' }, 
  wheat:          { stroke: '#d97706', fill: 'rgba(245,158,11,0.15)', accent: '#f59e0b' }, 
  maize:          { stroke: '#65a30d', fill: 'rgba(132,204,22,0.15)', accent: '#84cc16' }, 
  cotton:         { stroke: '#0891b2', fill: 'rgba(6,182,212,0.15)', accent: '#06b6d4' }, 
  sugarcane:      { stroke: '#047857', fill: 'rgba(5,150,105,0.15)', accent: '#059669' }, 
  jute:           { stroke: '#92400e', fill: 'rgba(180,83,9,0.15)', accent: '#b45309' }, 
  mustard:        { stroke: '#ca8a04', fill: 'rgba(234,179,8,0.15)', accent: '#eab308' }, 
  lentil:         { stroke: '#dc2626', fill: 'rgba(239,68,68,0.15)', accent: '#ef4444' }, 
  chickpea:       { stroke: '#ea580c', fill: 'rgba(249,115,22,0.15)', accent: '#f97316' }, 
  millet:         { stroke: '#b45309', fill: 'rgba(217,119,6,0.15)', accent: '#d97706' }, 
  sorghum:        { stroke: '#9a3412', fill: 'rgba(194,65,12,0.15)', accent: '#c2410c' }, 
  groundnut:      { stroke: '#713f12', fill: 'rgba(133,77,14,0.15)', accent: '#854d0e' }, 
  soybean:        { stroke: '#16a34a', fill: 'rgba(34,197,94,0.15)', accent: '#22c55e' }, 
  potato:         { stroke: '#57534e', fill: 'rgba(120,113,108,0.15)', accent: '#78716c' }, 
  tomato:         { stroke: '#b91c1c', fill: 'rgba(220,38,38,0.15)', accent: '#dc2626' }, 
  'green gram':   { stroke: '#15803d', fill: 'rgba(22,163,74,0.15)', accent: '#16a34a' }, 
  'black gram':   { stroke: '#6d28d9', fill: 'rgba(124,58,237,0.15)', accent: '#7c3aed' }, 
  'pearl millet': { stroke: '#a16207', fill: 'rgba(202,138,4,0.15)', accent: '#ca8a04' }, 
  cowpea:         { stroke: '#0f766e', fill: 'rgba(13,148,136,0.15)', accent: '#0d9488' }, 
  peanut:         { stroke: '#854d0e', fill: 'rgba(161,98,7,0.15)', accent: '#a16207' }, 
  sunflower:      { stroke: '#eab308', fill: 'rgba(250,204,21,0.15)', accent: '#facc15' }, 
};

const DEFAULT_THEME = { stroke: '#059669', fill: 'rgba(16,185,129,0.15)', accent: '#10b981' };

function getCropTheme(cropName: string) {
  return CROP_THEMES[cropName.toLowerCase()] || DEFAULT_THEME;
}

export const FarmBlueprint: React.FC<FarmBlueprintProps> = ({ strategy, request }) => {
  const [hoveredCrop, setHoveredCrop] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent, cropName: string) => {
    setHoveredCrop(cropName);
    setMousePos({ x: e.clientX, y: e.clientY });
  };
  const handleMouseLeave = () => {
    setHoveredCrop(null);
  };
  
  // Calculate field size coordinates in meters (1 Acre = 4047 sqm)
  const totalAreaSqm = request.acres * 4046.86;
  const estimatedWidthM = Math.round(Math.sqrt(totalAreaSqm * 1.5));
  const estimatedHeightM = Math.round(totalAreaSqm / estimatedWidthM);

  const layoutType = strategy.farmLayout?.layoutType?.toLowerCase() || 'block cropping';

  // Parse crops and dynamic bounds using raw area ratio to avoid rounding gaps
  const uniqueCrops = useMemo(() => {
    const entries = Object.entries(strategy.landDistribution);
    const totalArea = entries.reduce((sum, [, val]) => sum + (val as number), 0);
    return entries.map(([cropName, areaVal]) => {
      const area = areaVal as number;
      const percentage = Math.round((area / totalArea) * 100);
      const ratio = totalArea > 0 ? area / totalArea : 0.33;
      return { cropName, area, percentage, ratio };
    });
  }, [strategy]);

  // Generate calibrated crop polygons inside the farm boundaries (x=10 to 110, y=10 to 70)
  const fieldZones = useMemo(() => {
    const fw = 100; // field width inside SVG
    const fh = 60;  // field height inside SVG
    const zonesList: {
      cropName: string;
      x: number;
      y: number;
      w: number;
      h: number;
      area: number;
      percentage: number;
    }[] = [];

    if (uniqueCrops.length === 0) return zonesList;

    if (layoutType.includes('block')) {
      // Block Layout splits the field cleanly based on crop ratio
      if (uniqueCrops.length === 3) {
        const [c1, c2, c3] = uniqueCrops;
        const w1 = fw * c1.ratio;
        const w2 = fw - w1;
        const h2 = fh * (c2.ratio / (c2.ratio + c3.ratio));

        // Block 1 (Left - Main Crop)
        zonesList.push({ ...c1, x: 10, y: 10, w: w1, h: fh });
        // Block 2 (Top Right - Companion 1)
        zonesList.push({ ...c2, x: 10 + w1, y: 10, w: w2, h: h2 });
        // Block 3 (Bottom Right - Companion 2)
        zonesList.push({ ...c3, x: 10 + w1, y: 10 + h2, w: w2, h: fh - h2 });
      } else {
        // Standard vertical slicing for other lengths
        let curX = 10;
        uniqueCrops.forEach(c => {
          const w = fw * c.ratio;
          zonesList.push({ ...c, x: curX, y: 10, w, h: fh });
          curX += w;
        });
      }
    } else if (layoutType.includes('strip')) {
      // Strip layout: Draw exactly 3 broad horizontal bands matching their area ratio
      let curY = 10;
      uniqueCrops.forEach(c => {
        const h = fh * c.ratio;
        zonesList.push({
          ...c,
          x: 10,
          y: curY,
          w: fw,
          h,
        });
        curY += h;
      });
    } else {
      // Intercropping: alternating vertical rows (8 cycles, yielding 24 narrow stripes)
      const slices = 8;
      let curX = 10;

      for (let s = 0; s < slices; s++) {
        uniqueCrops.forEach(c => {
          const w = (fw / slices) * c.ratio;
          zonesList.push({
            ...c,
            x: curX,
            y: 10,
            w,
            h: fh,
          });
          curX += w;
        });
      }
    }

    return zonesList;
  }, [uniqueCrops, layoutType]);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 font-sans shadow-sm relative overflow-hidden">
      
      {/* Background blueprint grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(to right, rgba(148,163,184,0.1) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(148,163,184,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '30px 30px'
      }} />

      {/* Blueprint Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 mb-6 relative z-10">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Ruler className="w-5 h-5 text-emerald-600" /> Farm Field Layout
          </h2>
          <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mt-1">
            Scaled dimensions for {request.acres} acres
          </p>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs">
          <Compass className="w-4 h-4 text-slate-600" />
          <span className="text-xs font-bold text-slate-700 capitalize">{layoutType} Mode</span>
        </div>
      </div>

      {/* Schematic Interactive SVG Map */}
      <div className="relative border border-slate-200 bg-slate-50 rounded-2xl overflow-x-auto p-4 mb-8">
        <svg viewBox="0 0 130 90" className="w-full min-w-[650px] aspect-[1.44/1]">
          {/* Grid ruler guides - Top Ruler */}
          <line x1="10" y1="6" x2="110" y2="6" stroke="#cbd5e1" strokeWidth="0.5" />
          <line x1="10" y1="4" x2="10" y2="8" stroke="#94a3b8" strokeWidth="0.5" />
          <line x1="60" y1="4" x2="60" y2="8" stroke="#94a3b8" strokeWidth="0.5" />
          <line x1="110" y1="4" x2="110" y2="8" stroke="#94a3b8" strokeWidth="0.5" />
          <text x="10" y="3" textAnchor="middle" fill="#64748b" fontSize="2.2" fontWeight="600">0m</text>
          <text x="60" y="3" textAnchor="middle" fill="#64748b" fontSize="2.2" fontWeight="600">{Math.round(estimatedWidthM / 2)}m</text>
          <text x="110" y="3" textAnchor="middle" fill="#64748b" fontSize="2.2" fontWeight="600">{estimatedWidthM}m</text>

          {/* Grid ruler guides - Left Ruler */}
          <line x1="6" y1="10" x2="6" y2="70" stroke="#cbd5e1" strokeWidth="0.5" />
          <line x1="4" y1="10" x2="8" y2="10" stroke="#94a3b8" strokeWidth="0.5" />
          <line x1="4" y1="40" x2="8" y2="40" stroke="#94a3b8" strokeWidth="0.5" />
          <line x1="4" y1="70" x2="8" y2="70" stroke="#94a3b8" strokeWidth="0.5" />
          <text x="2" y="10.8" fill="#64748b" fontSize="2.2" fontWeight="600" textAnchor="start">0m</text>
          <text x="2" y="40.8" fill="#64748b" fontSize="2.2" fontWeight="600" textAnchor="start">{Math.round(estimatedHeightM / 2)}m</text>
          <text x="2" y="70.8" fill="#64748b" fontSize="2.2" fontWeight="600" textAnchor="start">{estimatedHeightM}m</text>

          {/* Soil Base Field Background */}
          <rect x="10" y="10" width="100" height="60" fill="#f8fafc" rx="1" />

          {/* Planted Field Zones (Drawn dynamically) */}
          {fieldZones.map((zone, idx) => {
            const theme = getCropTheme(zone.cropName);
            return (
              <g 
                key={`zone-rect-${idx}`}
                onMouseMove={(e) => handleMouseMove(e, zone.cropName)}
                onMouseLeave={handleMouseLeave}
                className="cursor-crosshair transition-opacity hover:opacity-80"
              >
                {/* Field Soil/Crop base background */}
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.w}
                  height={zone.h}
                  fill={theme.fill}
                  stroke="none"
                />

                {/* Sowing Rows pattern inside the field to represent crops */}
                {layoutType.includes('intercrop') ? (
                  // Intercropping: Draw exactly 1 row down the center of this slice
                  <line
                    x1={zone.x + zone.w / 2}
                    y1={zone.y + 1}
                    x2={zone.x + zone.w / 2}
                    y2={zone.y + zone.h - 1}
                    stroke={theme.accent}
                    strokeWidth="0.3"
                    strokeDasharray="1,1.5"
                  />
                ) : layoutType.includes('strip') ? (
                  // Strip Cropping: Draw horizontal rows proportional to height (1 row per 2.2 units)
                  <g opacity="0.6">
                    {Array.from({ length: Math.max(1, Math.floor(zone.h / 2.2)) }).map((_, rIdx) => {
                      const ry = zone.y + zone.h / (Math.max(1, Math.floor(zone.h / 2.2)) + 1) * (rIdx + 1);
                      return (
                        <line
                          key={`row-${rIdx}`}
                          x1={zone.x + 1}
                          y1={ry}
                          x2={zone.x + zone.w - 1}
                          y2={ry}
                          stroke={theme.accent}
                          strokeWidth="0.3"
                          strokeDasharray="1,1.5"
                        />
                      );
                    })}
                  </g>
                ) : (
                  // Block Cropping: Draw vertical rows proportional to width (1 row per 2.5 units)
                  <g opacity="0.6">
                    {Array.from({ length: Math.max(1, Math.floor(zone.w / 2.5)) }).map((_, rIdx) => {
                      const rx = zone.x + zone.w / (Math.max(1, Math.floor(zone.w / 2.5)) + 1) * (rIdx + 1);
                      return (
                        <line
                          key={`row-${rIdx}`}
                          x1={rx}
                          y1={zone.y + 1}
                          x2={rx}
                          y2={zone.y + zone.h - 1}
                          stroke={theme.accent}
                          strokeWidth="0.3"
                          strokeDasharray="1,1.5"
                        />
                      );
                    })}
                  </g>
                )}

                {/* Outer crop separator line */}
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.w}
                  height={zone.h}
                  fill="none"
                  stroke={theme.stroke}
                  strokeWidth="0.5"
                />
              </g>
            );
          })}

          {/* Calibration Badges (Displayed overlay for Block Cropping only to keep map clutter-free) */}
          {layoutType.includes('block') && uniqueCrops.map((crop, idx) => {
            const theme = getCropTheme(crop.cropName);
            const zone = fieldZones.find(z => z.cropName === crop.cropName && z.w > 1);
            if (!zone) return null;

            const cx = zone.x + zone.w / 2;
            const cy = zone.y + zone.h / 2;

            return (
              <g key={`badge-${idx}`} className="pointer-events-none">
                <rect
                  x={cx - 15}
                  y={cy - 6}
                  width="30"
                  height="12"
                  rx="2"
                  fill="#ffffff"
                  stroke={theme.stroke}
                  strokeWidth="0.5"
                />
                <text x={cx} y={cy - 1} textAnchor="middle" fill="#334155" fontSize="2" fontWeight="700" className="capitalize">
                  {crop.cropName}
                </text>
                <text x={cx} y={cy + 3.5} textAnchor="middle" fill={theme.stroke} fontSize="1.8" fontWeight="600">
                  {crop.area} Acres ({crop.percentage}%)
                </text>
              </g>
            );
          })}

          {/* Compass rose */}
          <g transform="translate(122, 18)" className="pointer-events-none">
            <circle cx="0" cy="0" r="5" fill="none" stroke="#cbd5e1" strokeWidth="0.4" strokeDasharray="1,1" />
            <line x1="0" y1="-7" x2="0" y2="7" stroke="#94a3b8" strokeWidth="0.4" />
            <line x1="-7" y1="0" x2="7" y2="0" stroke="#94a3b8" strokeWidth="0.4" />
            <polygon points="0,-6 -1.2,-1.2 0,0" fill="#64748b" />
            <polygon points="0,6 1.2,1.2 0,0" fill="none" stroke="#94a3b8" strokeWidth="0.4" />
            <text x="0" y="-8" textAnchor="middle" fill="#64748b" fontSize="2.2" fontWeight="600">N</text>
          </g>

          {/* Scale Legend (Scale Bar) */}
          <g transform="translate(116, 32)">
            <line x1="0" y1="0" x2="10" y2="0" stroke="#94a3b8" strokeWidth="1" />
            <line x1="0" y1="-1" x2="0" y2="1" stroke="#94a3b8" strokeWidth="0.4" />
            <line x1="5" y1="-1" x2="5" y2="1" stroke="#94a3b8" strokeWidth="0.4" />
            <line x1="10" y1="-1" x2="10" y2="1" stroke="#94a3b8" strokeWidth="0.4" />
            <text x="5" y="4" textAnchor="middle" fill="#64748b" fontSize="1.6" fontStyle="italic">SCALE</text>
            <text x="0" y="-2" textAnchor="middle" fill="#64748b" fontSize="1.6">0</text>
            <text x="10" y="-2" textAnchor="middle" fill="#64748b" fontSize="1.6">{Math.round(estimatedWidthM * 0.1)}m</text>
          </g>

          {/* Legend panel for Strip/Row Cropping */}
          {!layoutType.includes('block') && (
            <g transform="translate(112, 42)">
              <rect x="0" y="0" width="16" height="28" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" rx="1" />
              <text x="8" y="4" textAnchor="middle" fill="#475569" fontSize="1.8" fontWeight="bold">LEGEND</text>
              {uniqueCrops.map((crop, idx) => {
                const theme = getCropTheme(crop.cropName);
                return (
                  <g key={`legend-${idx}`} transform={`translate(2, ${6 + idx * 7.2})`}>
                    <rect x="0" y="0" width="12" height="5.5" fill={theme.fill} stroke={theme.stroke} strokeWidth="0.4" rx="0.5" />
                    <text x="6" y="2.2" textAnchor="middle" fill="#334155" fontSize="1.4" fontWeight="600" className="capitalize">{crop.cropName}</text>
                    <text x="6" y="4.5" textAnchor="middle" fill={theme.stroke} fontSize="1.2" fontWeight="700">{crop.area} Acres</text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Blueprint Title Block (Bottom Right Corner) */}
          <g transform="translate(72, 73)">
            <rect x="0" y="0" width="48" height="15" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.6" />
            <line x1="0" y1="4" x2="48" y2="4" stroke="#cbd5e1" strokeWidth="0.3" />
            <line x1="0" y1="8" x2="48" y2="8" stroke="#cbd5e1" strokeWidth="0.3" />
            <line x1="0" y1="11.5" x2="48" y2="11.5" stroke="#cbd5e1" strokeWidth="0.3" />
            
            <line x1="28" y1="8" x2="28" y2="15" stroke="#cbd5e1" strokeWidth="0.3" />
            <line x1="16" y1="11.5" x2="16" y2="15" stroke="#cbd5e1" strokeWidth="0.3" />

            <text x="2" y="3" fill="#1e293b" fontSize="2" fontWeight="700">FARM FIELD LAYOUT MAP</text>
            <text x="2" y="6.8" fill="#64748b" fontSize="1.6" fontWeight="600">PLAN: {strategy.name}</text>
            
            <text x="2" y="10.2" fill="#64748b" fontSize="1.4">SOIL: {request.soilType}</text>
            <text x="29" y="10.2" fill="#64748b" fontSize="1.4">SEAS: {request.season}</text>
            
            <text x="2" y="13.8" fill="#64748b" fontSize="1.4">ACRES: {request.acres} ac</text>
            <text x="17" y="13.8" fill="#64748b" fontSize="1.4">LAYOUT: {layoutType.split(' ')[0].toUpperCase()}</text>
            <text x="29" y="13.8" fill="#64748b" fontSize="1.4">GEN: AI</text>
          </g>
        </svg>
      </div>

      {/* Sowing Protocols Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 relative z-10 space-y-6">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Sprout className="w-5 h-5 text-emerald-600" /> Sowing Guidelines & Metrics
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-sans">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 font-semibold">Crop</th>
                <th className="pb-3 font-semibold">Color Key</th>
                <th className="pb-3 font-semibold">Area</th>
                <th className="pb-3 font-semibold">Est. Yield</th>
                <th className="pb-3 font-semibold">Water Need</th>
                <th className="pb-3 font-semibold">Seed Depth</th>
                <th className="pb-3 font-semibold">Row Spacing</th>
                <th className="pb-3 font-semibold">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {uniqueCrops.map(({ cropName, area, percentage }, idx) => {
                const theme = getCropTheme(cropName);
                const metadata = getSowingMetadata(cropName);
                const estYield = strategy.predictedYield[cropName] || 0;
                const waterReq = strategy.waterRequirementPerCrop[cropName] || 0;

                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-bold capitalize flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: theme.stroke }} />
                      {cropName}
                    </td>
                    <td className="py-4">
                      <div className="w-6 h-4 rounded border border-slate-200" style={{ backgroundColor: theme.fill }} />
                    </td>
                    <td className="py-4 font-medium">{area} Acres ({percentage}%)</td>
                    <td className="py-4 text-emerald-600 font-bold">{estYield.toLocaleString()} kg</td>
                    <td className="py-4 text-blue-600 font-bold">{waterReq} mm</td>
                    <td className="py-4 text-slate-600">{metadata.depth}</td>
                    <td className="py-4 text-slate-600">{metadata.spacing}</td>
                    <td className="py-4 text-slate-500">{metadata.method}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Interactive Tooltip */}
      {hoveredCrop && (
        <div 
          className="fixed z-50 pointer-events-none bg-slate-800/95 backdrop-blur-sm text-white p-4 rounded-xl shadow-2xl text-xs space-y-1.5 border border-slate-700/50 min-w-[200px]"
          style={{ 
            left: mousePos.x + 15, 
            top: mousePos.y + 15 
          }}
        >
          {(() => {
            const meta = getSowingMetadata(hoveredCrop);
            const water = strategy.waterRequirementPerCrop[hoveredCrop] || 0;
            return (
              <>
                <div className="font-bold text-sm text-emerald-400 capitalize mb-3 pb-2 border-b border-slate-700/50 flex items-center gap-2">
                  <Sprout className="w-4 h-4" /> {hoveredCrop}
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-slate-400">Sowing Depth:</span> 
                  <span className="font-semibold text-slate-100">{meta.depth}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-slate-400">Row Spacing:</span> 
                  <span className="font-semibold text-slate-100">{meta.spacing}</span>
                </div>
                <div className="flex justify-between items-center gap-4 pt-1">
                  <span className="text-slate-400">Water Req:</span> 
                  <span className="font-semibold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded">{water} mm</span>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
