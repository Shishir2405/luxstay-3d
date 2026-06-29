'use client';

import { useMemo, useRef, useState } from 'react';
import { Html, ContactShadows, Environment, RoundedBox, Float } from '@react-three/drei';
import { useTourStore } from '@/store/tour';
import { ZONES, type ZoneDef, type Vec3 } from './zones';

/* ─────────────────────────────────────────────────────────────────────────
   Lighting moods. Warm champagne by day, cool & dim by night.
   ───────────────────────────────────────────────────────────────────────── */
const MOOD = {
  day: {
    ambient: 0.55,
    keyIntensity: 1.4,
    keyColor: '#fff3dd',
    fill: '#ffe7c2',
    background: '#f4ecdd',
    floor: '#e7ddc9',
    env: 'sunset' as const,
  },
  night: {
    ambient: 0.18,
    keyIntensity: 0.5,
    keyColor: '#9fb6e0',
    fill: '#2b3550',
    background: '#10131c',
    floor: '#1b1f2a',
    env: 'night' as const,
  },
};

/* ─────────────────────────────────────────────────────────────────────────
   A simple stylized "building block" — a rounded box footprint for a zone.
   ───────────────────────────────────────────────────────────────────────── */
function Pavilion({ position, size, color }: { position: Vec3; size: Vec3; color: string }) {
  return (
    <RoundedBox
      args={size}
      radius={0.12}
      smoothness={3}
      position={position}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={color} roughness={0.65} metalness={0.1} />
    </RoundedBox>
  );
}

/* A small piece of furniture / decor block to add life to a zone. */
function Block({
  position,
  size,
  color,
  metalness = 0.1,
  roughness = 0.6,
}: {
  position: Vec3;
  size: Vec3;
  color: string;
  metalness?: number;
  roughness?: number;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </mesh>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Clickable zone marker — a glowing gold disc + a floating Html label that
   sets the active zone on click.
   ───────────────────────────────────────────────────────────────────────── */
function ZoneMarker({ zone, active }: { zone: ZoneDef; active: boolean }) {
  const setZone = useTourStore((s) => s.setZone);
  const [hovered, setHovered] = useState(false);

  return (
    <group position={zone.position}>
      <Float speed={2} rotationIntensity={0} floatIntensity={0.5} floatingRange={[-0.08, 0.08]}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            setZone(zone.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
          position={[0, 1.6, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.28, 0.42, 32]} />
          <meshBasicMaterial
            color={zone.color}
            transparent
            opacity={active ? 1 : hovered ? 0.9 : 0.6}
          />
        </mesh>

        <mesh position={[0, 1.6, 0]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial
            color={zone.color}
            emissive={zone.color}
            emissiveIntensity={active ? 1.4 : 0.6}
            roughness={0.2}
          />
        </mesh>
      </Float>

      <Html position={[0, 2.4, 0]} center distanceFactor={12} occlude={false}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setZone(zone.id);
          }}
          className={[
            'pointer-events-auto select-none whitespace-nowrap rounded-full px-3 py-1 text-center',
            'border backdrop-blur-md transition-all duration-200',
            active
              ? 'border-accent/80 bg-primary/85 text-primary-foreground shadow-glow'
              : 'border-white/15 bg-black/45 text-white/85 hover:border-accent/60 hover:bg-black/60',
          ].join(' ')}
        >
          <span className="block font-display text-[13px] font-semibold leading-tight">
            {zone.label}
          </span>
          <span className="block text-[10px] uppercase tracking-wider opacity-70">
            {zone.blurb}
          </span>
        </button>
      </Html>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   The full property — a stylized lobby + zone pavilions built from primitives.
   ───────────────────────────────────────────────────────────────────────── */
export function HotelScene() {
  const dayNight = useTourStore((s) => s.dayNight);
  const activeZone = useTourStore((s) => s.zone);
  const mood = MOOD[dayNight];

  const keyLight = useRef(null);

  // Pillars framing the central reception, memoized so we don't rebuild each render.
  const pillars = useMemo<Vec3[]>(
    () => [
      [-3.5, 2.4, -2],
      [3.5, 2.4, -2],
      [-3.5, 2.4, 2],
      [3.5, 2.4, 2],
    ],
    [],
  );

  return (
    <>
      {/* Atmosphere */}
      <color attach="background" args={[mood.background]} />
      <fog attach="fog" args={[mood.background, 18, 48]} />

      {/* Lighting — warm by day, cool/dim by night */}
      <ambientLight intensity={mood.ambient} color={mood.keyColor} />
      <directionalLight
        ref={keyLight}
        position={[6, 12, 8]}
        intensity={mood.keyIntensity}
        color={mood.keyColor}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      <hemisphereLight args={[mood.keyColor, mood.floor, mood.ambient * 0.6]} />

      <Environment preset={mood.env} background={false} />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -10]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color={mood.floor} roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Central reception lobby */}
      <group position={[0, 0, 0]}>
        {/* Reception desk */}
        <Block position={[0, 0.6, 0]} size={[5, 1.2, 1.4]} color="#8a6a38" roughness={0.5} />
        <Block position={[0, 1.35, 0]} size={[5.2, 0.12, 1.6]} color="#d9c08a" metalness={0.3} />
        {/* Back wall / brand panel */}
        <Block position={[0, 2.6, -2.6]} size={[8, 5, 0.4]} color="#efe6d4" roughness={0.8} />
        {/* Pillars */}
        {pillars.map((p, i) => (
          <mesh key={i} position={p} castShadow receiveShadow>
            <cylinderGeometry args={[0.32, 0.32, 4.8, 16]} />
            <meshStandardMaterial color="#e7ddc9" roughness={0.7} />
          </mesh>
        ))}
        {/* Lounge seating */}
        <Block position={[-2.4, 0.35, 3.2]} size={[1.8, 0.6, 1.2]} color="#6f5536" />
        <Block position={[2.4, 0.35, 3.2]} size={[1.8, 0.6, 1.2]} color="#6f5536" />
        {/* Rug */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 3]} receiveShadow>
          <planeGeometry args={[7, 4]} />
          <meshStandardMaterial color="#9a7b46" roughness={0.95} />
        </mesh>
      </group>

      {/* Suites wing */}
      <group position={[-9, 0, -3]}>
        <Pavilion position={[0, 1.4, 0]} size={[5, 2.8, 4]} color="#e3d7c0" />
        <Block
          position={[0, 1.3, 2.05]}
          size={[1.2, 1.4, 0.1]}
          color="#7fa9c4"
          metalness={0.4}
          roughness={0.2}
        />
        <Block
          position={[-1.6, 1.3, 2.05]}
          size={[1.2, 1.4, 0.1]}
          color="#7fa9c4"
          metalness={0.4}
          roughness={0.2}
        />
        <Block
          position={[1.6, 1.3, 2.05]}
          size={[1.2, 1.4, 0.1]}
          color="#7fa9c4"
          metalness={0.4}
          roughness={0.2}
        />
      </group>

      {/* Restaurant wing */}
      <group position={[9, 0, -3]}>
        <Pavilion position={[0, 1.2, 0]} size={[5, 2.4, 4]} color="#ead9c2" />
        {/* dining tables */}
        <Block position={[-1.2, 0.5, 1.6]} size={[0.9, 0.1, 0.9]} color="#caa14a" metalness={0.3} />
        <Block position={[1.2, 0.5, 1.6]} size={[0.9, 0.1, 0.9]} color="#caa14a" metalness={0.3} />
      </group>

      {/* Bar & lounge */}
      <group position={[-9, 0, -12]}>
        <Pavilion position={[0, 1.2, 0]} size={[5, 2.4, 4]} color="#3b2f44" />
        <Block
          position={[0, 0.7, 1.4]}
          size={[3.2, 1.1, 0.8]}
          color="#241b2c"
          metalness={0.4}
          roughness={0.3}
        />
        <Block
          position={[0, 1.4, 1.4]}
          size={[3.4, 0.1, 1]}
          color="#caa14a"
          metalness={0.6}
          roughness={0.2}
        />
      </group>

      {/* Events / ballroom */}
      <group position={[9, 0, -12]}>
        <Pavilion position={[0, 1.8, 0]} size={[6, 3.6, 5]} color="#f0e2cb" />
        {/* chandelier hint */}
        <mesh position={[0, 3, 0]}>
          <icosahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial
            color="#ffe6a8"
            emissive="#ffcf6b"
            emissiveIntensity={dayNight === 'night' ? 1.6 : 0.4}
          />
        </mesh>
      </group>

      {/* Rooftop terrace + infinity pool (elevated) */}
      <group position={[0, 4, -21]}>
        {/* deck slab */}
        <Block
          position={[0, 0.5, 0]}
          size={[12, 1, 8]}
          color={dayNight === 'night' ? '#262c3a' : '#d7cab2'}
        />
        {/* pool */}
        <mesh position={[0, 1.06, -3]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[7, 3]} />
          <meshStandardMaterial
            color="#3f9fb8"
            metalness={0.3}
            roughness={0.1}
            transparent
            opacity={0.85}
          />
        </mesh>
        {/* cabanas */}
        <Block position={[-4, 1.6, 1.5]} size={[1.4, 1.2, 1.4]} color="#efe6d4" />
        <Block position={[4, 1.6, 1.5]} size={[1.4, 1.2, 1.4]} color="#efe6d4" />
      </group>

      {/* Soft contact shadow under the central scene for grounding */}
      <ContactShadows
        position={[0, 0.01, -6]}
        opacity={dayNight === 'night' ? 0.35 : 0.5}
        scale={50}
        blur={2.5}
        far={12}
      />

      {/* Clickable zone markers + labels */}
      {ZONES.map((zone) => (
        <ZoneMarker key={zone.id} zone={zone} active={zone.id === activeZone} />
      ))}
    </>
  );
}
