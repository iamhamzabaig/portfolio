import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer.jsx';
import { coverGradient, monogram } from '../cover.js';

const MEDIA_CLASS = 'aspect-[16/10] w-full rounded-2xl border border-border object-cover';

export function MediaGallery({ video, screenshots = [], coverImage, title }) {
  const slides = [];
  if (video?.url) slides.push({ type: 'video', url: video.url });
  for (const s of screenshots) if (s?.url) slides.push({ type: 'image', url: s.url });

  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (count < 2 || hovered || videoPlaying) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(timer);
  }, [count, hovered, videoPlaying]);

  if (count === 0) {
    return coverImage?.url ? (
      <img src={coverImage.url} alt="" className={MEDIA_CLASS} />
    ) : (
      <div
        className="flex aspect-[16/10] w-full items-center justify-center rounded-2xl border border-border"
        style={{ backgroundImage: coverGradient({ title }) }}
      >
        <span className="font-display text-6xl font-bold text-white/90">{monogram(title)}</span>
      </div>
    );
  }

  const current = slides[index];

  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {current.type === 'video' ? (
        <VideoPlayer src={current.url} poster={coverImage?.url} onPlayingChange={setVideoPlaying} />
      ) : (
        <img src={current.url} alt="" className={MEDIA_CLASS} />
      )}
      {count > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={() => setIndex((i) => (i - 1 + count) % count)}
            className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-bg/60 backdrop-blur"
          >
            <ChevronLeft aria-hidden="true" size={18} />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => setIndex((i) => (i + 1) % count)}
            className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-bg/60 backdrop-blur"
          >
            <ChevronRight aria-hidden="true" size={18} />
          </button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
            {slides.map((s, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={`h-2 w-2 rounded-full ${i === index ? 'bg-ink' : 'bg-ink/40'}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
