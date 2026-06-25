import { lazy, Suspense } from 'react';
import { StaticGlow } from './StaticGlow.jsx';
import { useShouldRender3D } from './useShouldRender3D.js';

const LazyHeroScene = lazy(() => import('./HeroScene.jsx'));

export default function HeroVisual({ pointer }) {
  const { render, animate } = useShouldRender3D();

  if (!render) {
    return <StaticGlow {...pointer} />;
  }

  return (
    <Suspense fallback={<StaticGlow {...pointer} />}>
      <LazyHeroScene animate={animate} pointer={pointer} />
    </Suspense>
  );
}
