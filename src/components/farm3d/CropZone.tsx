import { useRef, useMemo, useState, type FC } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

// Crop color palettes — main ground color + plant colors
const CROP_PALETTES: Record<string, { ground: string; stem: string; head: string; accent: string }> = {
  rice:       { ground: '#5B8C3E', stem: '#6B9B4E', head: '#A8D86E', accent: '#E8F5C8' },
  wheat:      { ground: '#C4A24E', stem: '#9B8332', head: '#F0D060', accent: '#FFF4CC' },
  maize:      { ground: '#6B9B4E', stem: '#4A7A30', head: '#E8C840', accent: '#FFF0A0' },
  cotton:     { ground: '#7BA05B', stem: '#5D8240', head: '#F0EEE0', accent: '#FFFFFF' },
  sugarcane:  { ground: '#4D8C3A', stem: '#3A7028', head: '#8BC060', accent: '#C0E890' },
  jute:       { ground: '#6B8B4E', stem: '#4A703A', head: '#A8C878', accent: '#D0E8A8' },
  mustard:    { ground: '#8B8B3E', stem: '#707020', head: '#E8D030', accent: '#FFF060' },
  lentil:     { ground: '#8B7B4E', stem: '#6B5B30', head: '#C0A050', accent: '#E0D090' },
  chickpea:   { ground: '#9B8B5E', stem: '#7B6B40', head: '#D0B870', accent: '#F0E0B0' },
  millet:     { ground: '#7B7B3E', stem: '#5B5B28', head: '#C0B050', accent: '#E0D880' },
  sorghum:    { ground: '#6B7B4E', stem: '#4B5B30', head: '#B0A060', accent: '#D8C890' },
  groundnut:  { ground: '#8B7B4E', stem: '#6B5B30', head: '#C0A050', accent: '#E8D098' },
  soybean:    { ground: '#5B8B4E', stem: '#3B6B30', head: '#90C060', accent: '#C0E0A0' },
  potato:     { ground: '#7B8B5E', stem: '#5B6B40', head: '#A0B080', accent: '#D0E0B8' },
  tomato:     { ground: '#5B7B4E', stem: '#3B6030', head: '#E04030', accent: '#FF6858' },
};

const DEFAULT_PALETTE = { ground: '#6B8B5E', stem: '#4B6B40', head: '#90B070', accent: '#C0D8A8' };

function getPalette(cropName: string) {
  return CROP_PALETTES[cropName.toLowerCase()] || DEFAULT_PALETTE;
}

// Seeded random for deterministic plant placement
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface CropZoneProps {
  cropName: string;
  area: number;
  totalArea: number;
  xOffset: number;
  zOffset: number;
  zoneWidth: number;
  zoneDepth: number;
  yieldKg: number;
  waterMm: number;
  index: number;
}

// ─── Individual Plant Geometry Components ────────────────────────────────────

function WheatPlant({ position, scale, color }: { position: [number, number, number]; scale: number; color: { stem: string; head: string } }) {
  return (
    <group position={position} scale={scale}>
      {/* Stem */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.015, 0.02, 0.6, 4]} />
        <meshStandardMaterial color={color.stem} roughness={0.8} />
      </mesh>
      {/* Grain head */}
      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.04, 0.12, 5]} />
        <meshStandardMaterial color={color.head} roughness={0.9} />
      </mesh>
    </group>
  );
}

function BroadLeafPlant({ position, scale, color }: { position: [number, number, number]; scale: number; color: { stem: string; head: string } }) {
  return (
    <group position={position} scale={scale}>
      {/* Stem */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.02, 0.025, 0.3, 5]} />
        <meshStandardMaterial color={color.stem} roughness={0.8} />
      </mesh>
      {/* Canopy / leaves */}
      <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
        <icosahedronGeometry args={[0.12, 1]} />
        <meshStandardMaterial color={color.head} flatShading roughness={0.9} />
      </mesh>
    </group>
  );
}

function TallStalkPlant({ position, scale, color }: { position: [number, number, number]; scale: number; color: { stem: string; head: string } }) {
  return (
    <group position={position} scale={scale}>
      {/* Tall stalk */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.025, 0.035, 1.0, 5]} />
        <meshStandardMaterial color={color.stem} roughness={0.8} />
      </mesh>
      {/* Top cluster */}
      <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial color={color.head} flatShading roughness={0.9} />
      </mesh>
    </group>
  );
}

function RoundBushPlant({ position, scale, color }: { position: [number, number, number]; scale: number; color: { stem: string; head: string; accent: string } }) {
  return (
    <group position={position} scale={scale}>
      {/* Short stem */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.02, 0.03, 0.2, 4]} />
        <meshStandardMaterial color={color.stem} roughness={0.8} />
      </mesh>
      {/* Bush body */}
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshStandardMaterial color={color.head} flatShading roughness={0.9} />
      </mesh>
      {/* Accent top */}
      <mesh position={[0.03, 0.38, 0.02]}>
        <sphereGeometry args={[0.04, 4, 4]} />
        <meshStandardMaterial color={color.accent} flatShading />
      </mesh>
    </group>
  );
}

// Determines which plant shape to use based on crop name
function getPlantType(cropName: string): 'wheat' | 'broadleaf' | 'tall' | 'bush' {
  const name = cropName.toLowerCase();
  if (['wheat', 'rice', 'millet', 'sorghum', 'jute'].includes(name)) return 'wheat';
  if (['maize', 'sugarcane', 'cotton'].includes(name)) return 'tall';
  if (['lentil', 'chickpea', 'groundnut', 'soybean', 'potato', 'mustard'].includes(name)) return 'bush';
  return 'broadleaf';
}

// ─── Main CropZone Component ─────────────────────────────────────────────────

export const CropZone: FC<CropZoneProps> = ({
  cropName, area, totalArea, xOffset, zOffset, zoneWidth, zoneDepth, yieldKg, waterMm, index
}) => {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null!);
  const palette = getPalette(cropName);
  const plantType = getPlantType(cropName);

  // Generate deterministic plant positions
  const plants = useMemo(() => {
    const rng = seededRandom(index * 1000 + cropName.length * 137);
    const density = 2.5; // plants per unit area
    const count = Math.min(Math.floor(zoneWidth * zoneDepth * density), 600);
    const positions: [number, number, number][] = [];
    
    // Dynamic margin to prevent issues with extremely thin strips (Intercropping)
    const marginX = Math.min(0.15, zoneWidth * 0.1);
    const marginZ = Math.min(0.15, zoneDepth * 0.1);

    for (let i = 0; i < count; i++) {
      const x = marginX + rng() * Math.max(0.01, (zoneWidth - marginX * 2));
      const z = marginZ + rng() * Math.max(0.01, (zoneDepth - marginZ * 2));
      const jitterY = rng() * 0.02;
      positions.push([x, jitterY, z]);
    }
    return positions;
  }, [zoneWidth, zoneDepth, index, cropName]);

  // Subtle hover animation
  useFrame(() => {
    if (groupRef.current) {
      const target = hovered ? 0.05 : 0;
      groupRef.current.position.y += (target - groupRef.current.position.y) * 0.1;
    }
  });

  const PlantComponent = {
    wheat: WheatPlant,
    broadleaf: BroadLeafPlant,
    tall: TallStalkPlant,
    bush: RoundBushPlant,
  }[plantType];

  return (
    <group
      ref={groupRef}
      position={[xOffset, 0, zOffset]}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
    >
      {/* Ground tile */}
      <mesh position={[zoneWidth / 2, -0.025, zoneDepth / 2]} receiveShadow>
        <boxGeometry args={[zoneWidth - 0.04, 0.05, zoneDepth - 0.04]} />
        <meshStandardMaterial
          color={hovered ? palette.accent : palette.ground}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Subtle border line */}
      <mesh position={[zoneWidth / 2, 0.001, zoneDepth / 2]}>
        <boxGeometry args={[zoneWidth, 0.002, zoneDepth]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.12} />
      </mesh>

      {/* Plants */}
      {plants.map((pos, i) => {
        const scale = 0.7 + (i % 5) * 0.12;
        return (
          <PlantComponent
            key={i}
            position={pos}
            scale={scale}
            color={palette}
          />
        );
      })}

      {/* Floating label - strictly conditionally rendered to eliminate visual clutter on dense intercropping */}
      {hovered && (
        <Html
          position={[zoneWidth / 2, 0.8, zoneDepth / 2]}
          center
          distanceFactor={8}
          style={{ pointerEvents: 'none' }}
        >
          <div style={{
            background: 'rgba(16, 185, 129, 0.95)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            padding: '12px 18px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: '"Inter", sans-serif',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            whiteSpace: 'nowrap',
            transition: 'all 0.3s ease',
            border: '1px solid rgba(255,255,255,0.3)',
            textAlign: 'center' as const,
            lineHeight: 1.5,
          }}>
            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: 4 }}>
              {cropName}
            </div>
            <div style={{ fontSize: '11px', opacity: 0.9 }}>
              <div>{area} acres · {yieldKg.toLocaleString()} kg yield</div>
              <div>💧 {waterMm} mm water</div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
