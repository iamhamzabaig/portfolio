import { useEffect, useMemo, useRef, useState } from 'react';
import { AdaptiveDpr, Float, PerformanceMonitor } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext.jsx';

const RADIUS = 1.35;
const DETAIL = 1;

function readAccentColor() {
  const color = new THREE.Color();
  if (typeof document === 'undefined') return color;

  const token = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  const channels = token.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [];

  if (channels.length === 3 && channels.every(Number.isFinite)) {
    color.setRGB(channels[0] / 255, channels[1] / 255, channels[2] / 255);
  }

  return color;
}

function getMotionValue(value) {
  return typeof value?.get === 'function' ? value.get() : 0;
}

// Glowing wireframe geodesic — "network/topology" signature.
// Unlit basic materials (no metalness => no environment-map dependency),
// theme-aware blending so it reads on both the cream and navy backgrounds.
function Mesh({ accentColor, isDark, animate, pointer }) {
  const groupRef = useRef(null);
  const autoRotation = useRef(0);

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(RADIUS, DETAIL), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);

  useEffect(
    () => () => {
      geometry.dispose();
      edges.dispose();
    },
    [geometry, edges]
  );

  useFrame((_, delta) => {
    if (!animate || !groupRef.current) return;

    const pointerX = THREE.MathUtils.clamp(getMotionValue(pointer?.glowX) / 30, -1, 1);
    const pointerY = THREE.MathUtils.clamp(getMotionValue(pointer?.glowY) / 30, -1, 1);

    autoRotation.current += delta * 0.18;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -pointerY * 0.28, 0.08);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      autoRotation.current + pointerX * 0.32,
      0.08
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, pointerX * 0.1, 0.08);
  });

  // Additive glow on the dark background; flat violet lines on the light one
  // (additive blending would wash out to white over the cream bg).
  const edgeBlending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;

  const group = (
    <group ref={groupRef} rotation={[0.12, -0.32, 0.08]}>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={accentColor} transparent opacity={isDark ? 0.1 : 0.06} depthWrite={false} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial
          color={accentColor}
          transparent
          opacity={isDark ? 0.62 : 0.78}
          blending={edgeBlending}
          depthWrite={false}
        />
      </lineSegments>
      <points geometry={geometry}>
        <pointsMaterial
          color={accentColor}
          size={0.07}
          sizeAttenuation
          transparent
          opacity={isDark ? 0.9 : 0.85}
          blending={edgeBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );

  if (!animate) return group;

  return (
    <Float speed={1.1} rotationIntensity={0.35} floatIntensity={0.5}>
      {group}
    </Float>
  );
}

function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || !ref.current) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
}

export default function HeroScene({ animate, pointer }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const accentColor = useMemo(() => readAccentColor(), [theme]);
  const [dpr, setDpr] = useState([1, 2]);
  const [containerRef, inView] = useInView();
  const shouldAnimate = animate && inView;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-[46%] h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 opacity-90"
    >
      <Canvas
        dpr={dpr}
        frameloop={shouldAnimate ? 'always' : 'demand'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 4], fov: 45 }}
        className="h-full w-full"
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} />
        <AdaptiveDpr pixelated />
        <Mesh accentColor={accentColor} isDark={isDark} animate={shouldAnimate} pointer={pointer} />
      </Canvas>
    </div>
  );
}
