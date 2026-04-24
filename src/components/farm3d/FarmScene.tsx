import { useMemo, type FC } from 'react';
import { OrbitControls, ContactShadows, Grid, Sky, Environment } from '@react-three/drei';
import { CropZone } from './CropZone';
import { Strategy, RecommendationRequest } from '../../types';

interface FarmSceneProps {
  strategy: Strategy;
  request: RecommendationRequest;
}

export const FarmScene: FC<FarmSceneProps> = ({ strategy, request }) => {
  // Calculate zone dimensions based on land distribution
  const { zones, totalWidth, depth } = useMemo(() => {
    const entries = Object.entries(strategy.landDistribution);
    const totalAcres = entries.reduce((sum: number, [, area]) => sum + (area as number), 0);
    
    // Scale factor: 1 acre = ~4 units in the scene for realism
    const scaleFactor = 4;
    const totalAreaUnits = totalAcres * scaleFactor;
    
    // Base bounding box of the whole farm (1.4 aspect ratio width/depth)
    const tw = Math.sqrt(totalAreaUnits) * 1.4;
    const d = totalAreaUnits / tw;

    const layoutType = strategy.farmLayout?.layoutType?.toLowerCase() || 'block cropping';
    
    const z: {
      cropName: string; area: number; totalArea: number;
      xOffset: number; zOffset: number;
      zoneWidth: number; zoneDepth: number;
      yieldKg: number; waterMm: number; index: number;
    }[] = [];

    // Helper to push common stats
    const addZone = (crop: string, a: number, x: number, zOff: number, w: number, zd: number, idx: number) => {
      z.push({
        cropName: crop, area: a, totalArea: totalAcres,
        xOffset: x, zOffset: zOff, zoneWidth: w, zoneDepth: zd,
        yieldKg: strategy.predictedYield[crop] || 0,
        waterMm: strategy.waterRequirementPerCrop[crop] || 0,
        index: idx,
      });
    };

    if (layoutType.includes('block')) {
      // BLOCK CROPPING: Massive separated grid chunks
      if (entries.length === 3) {
        const [main, c1, c2] = entries;
        const mArea = main[1] as number; const c1Area = c1[1] as number; const c2Area = c2[1] as number;
        
        const mProp = mArea / totalAcres;
        const mWidth = tw * mProp;
        
        // Main crop left half
        addZone(main[0], mArea, 0, 0, mWidth, d, 0);
        
        // Side crops split the right half based on their relative size
        const rightWidth = tw - mWidth;
        const c1Prop = c1Area / (c1Area + c2Area);
        const c1Depth = d * c1Prop;
        
        addZone(c1[0], c1Area, mWidth, 0, rightWidth, c1Depth, 1);
        addZone(c2[0], c2Area, mWidth, c1Depth, rightWidth, d - c1Depth, 2);
      } else {
        // Fallback simple column chunks
        let curX = 0;
        entries.forEach(([crop, area], i) => {
          const w = tw * ((area as number) / totalAcres);
          addZone(crop, area as number, curX, 0, w, d, i);
          curX += w;
        });
      }
    } else if (layoutType.includes('strip')) {
      // STRIP CROPPING: Horizontal strips across the Z axis (following land contours)
      const slices = 3;
      let curZ = 0;
      for (let s = 0; s < slices; s++) {
        entries.forEach(([crop, area], i) => {
          const stripD = d * (((area as number) / slices) / totalAcres);
          addZone(crop, area as number, 0, curZ, tw, stripD, i * 10 + s);
          curZ += stripD;
        });
      }
    } else {
      // INTERCROPPING: Extremely tight alternating rows along the X axis
      const slices = 8;
      let curX = 0;
      for (let s = 0; s < slices; s++) {
        entries.forEach(([crop, area], i) => {
          const stripW = tw * (((area as number) / slices) / totalAcres);
          addZone(crop, area as number, curX, 0, stripW, d, i * 10 + s);
          curX += stripW;
        });
      }
    }

    return { zones: z, totalWidth: tw, depth: d };
  }, [strategy]);

  const centerX = totalWidth / 2;
  const centerZ = depth / 2;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} color="#fef3c7" />
      <directionalLight
        position={[10, 15, 8]}
        intensity={1.8}
        color="#fff7ed"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <directionalLight position={[-5, 8, -5]} intensity={0.4} color="#bfdbfe" />
      
      {/* Sky/Environment */}
      <Sky distance={450000} sunPosition={[10, 15, 8]} inclination={0} azimuth={0.25} />
      <Environment preset="park" background={false} />
      <fog attach="fog" args={['#d1e8d8', 12, 45]} />
      
      {/* Ground base - extended ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[centerX, -0.06, centerZ]} receiveShadow>
        <planeGeometry args={[totalWidth + 8, depth + 8]} />
        <meshStandardMaterial color="#c8e6c9" roughness={1} />
      </mesh>

      {/* Subtle grid overlay for scale reference */}
      <Grid
        position={[centerX, -0.04, centerZ]}
        args={[totalWidth + 6, depth + 6]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#a8d5a8"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#7cb87c"
        fadeDistance={20}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
      />

      {/* Farm boundary fence posts */}
      <FencePosts totalWidth={totalWidth} depth={depth} />

      {/* Crop Zones */}
      <group>
        {zones.map((zone, i) => (
          <CropZone key={`zone-${zone.index}-${i}`} {...zone} />
        ))}
      </group>

      {/* Contact shadows for grounding */}
      <ContactShadows
        position={[centerX, -0.049, centerZ]}
        opacity={0.25}
        scale={totalWidth + 4}
        blur={2.5}
        far={4}
      />

      {/* Camera controls */}
      <OrbitControls
        makeDefault
        target={[centerX, 0.5, centerZ]}
        minDistance={3}
        maxDistance={25}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.2}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
};

// ─── Simple Fence Decoration ─────────────────────────────────────────────────

function FencePosts({ totalWidth, depth }: { totalWidth: number; depth: number }) {
  const posts = useMemo(() => {
    const result: [number, number, number][] = [];
    const spacing = 1.2;
    
    // Front and back edges
    for (let x = 0; x <= totalWidth; x += spacing) {
      result.push([x, 0.15, -0.15]);
      result.push([x, 0.15, depth + 0.15]);
    }
    // Left and right edges
    for (let z = 0; z <= depth; z += spacing) {
      result.push([-0.15, 0.15, z]);
      result.push([totalWidth + 0.15, 0.15, z]);
    }
    return result;
  }, [totalWidth, depth]);

  return (
    <group>
      {posts.map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <boxGeometry args={[0.04, 0.3, 0.04]} />
          <meshStandardMaterial color="#8B7355" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
