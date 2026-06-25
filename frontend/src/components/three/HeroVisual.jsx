import { lazy, Suspense } from 'react';
import { StaticGlow } from './StaticGlow.jsx';
import { useShouldRender3D } from './useShouldRender3D.js';

const LazyHeroScene = lazy(() => import('./HeroScene.jsx'));

export default function HeroVisual({ pointer }) {
  const { render, animate } = useShouldRender3D();

  if (!render) {
    return <StaticGlow {...pointer} />;
  }

  // Soft glow sits as a base layer; the wireframe mesh renders on top of it.
  return (
    <>
      <StaticGlow {...pointer} />
      <Suspense fallback={null}>
        <LazyHeroScene animate={animate} pointer={pointer} />
      </Suspense>
    </>
  );
}
