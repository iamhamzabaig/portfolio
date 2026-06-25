import { useEffect, useMemo, useRef, useState } from 'react';
import { AdaptiveDpr, Float, MeshDistortMaterial, PerformanceMonitor } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext.jsx';

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

function Icosahedron({ accentColor, animate, pointer }) {
  const meshRef = useRef(null);
  const autoRotation = useRef(0);

  useFrame((_, delta) => {
    if (!animate || !meshRef.current) return;

    const pointerX = THREE.MathUtils.clamp(getMotionValue(pointer?.glowX) / 30, -1, 1);
    const pointerY = THREE.MathUtils.clamp(getMotionValue(pointer?.glowY) / 30, -1, 1);

    autoRotation.current += delta * 0.32;
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -pointerY * 0.28, 0.08);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      autoRotation.current + pointerX * 0.32,
      0.08
    );
    meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, pointerX * 0.12, 0.08);
  });

  const mesh = (
    <mesh ref={meshRef} rotation={[0.12, -0.32, 0.08]}>
      <icosahedronGeometry args={[1.3, 0]} />
      <MeshDistortMaterial
        color={accentColor}
        distort={animate ? 0.25 : 0}
        speed={animate ? 1.5 : 0}
        roughness={0.2}
        metalness={0.6}
        flatShading
      />
    </mesh>
  );

  if (!animate) return mesh;

  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
      {mesh}
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
  const accentColor = useMemo(() => readAccentColor(), [theme]);
  const [dpr, setDpr] = useState([1, 2]);
  const [containerRef, inView] = useInView();
  const shouldAnimate = animate && inView;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2"
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
        <ambientLight intensity={0.38} />
        <directionalLight position={[2.8, 2.4, 3.5]} intensity={2.4} />
        <pointLight position={[-2.2, -1.4, 2.2]} intensity={5.5} color={accentColor} />
        <Icosahedron accentColor={accentColor} animate={shouldAnimate} pointer={pointer} />
      </Canvas>
    </div>
  );
}
