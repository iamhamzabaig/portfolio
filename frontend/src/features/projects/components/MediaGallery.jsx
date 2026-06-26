import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer.jsx';
import { Lightbox } from './Lightbox.jsx';
import { coverGradient, monogram } from '../cover.js';

const MEDIA_CLASS = 'aspect-[16/10] w-full rounded-2xl border border-border object-cover';

export function MediaGallery({ video, screenshots = [], coverImage, title }) {
  const slides = [];
  if (video?.url) slides.push({ type: 'video', url: video.url });
  for (const s of screenshots) if (s?.url) slides.push({ type: 'image', url: s.url });

  const images = screenshots.filter((s) => s?.url).map((s) => s.url);
  const hasVideo = video?.url ? 1 : 0;

  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [direction, setDirection] = useState(1);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    if (count < 2 || hovered || videoPlaying || lightboxIndex !== null) return undefined;
    const timer = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % count);
    }, 5000);
    return () => clearInterval(timer);
  }, [count, hovered, videoPlaying, lightboxIndex]);

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
    <div className="relative overflow-hidden rounded-2xl" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <motion.div
        key={index}
        initial={{ opacity: 0, x: direction * 48 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {current.type === 'video' ? (
          <VideoPlayer src={current.url} poster={coverImage?.url} onPlayingChange={setVideoPlaying} />
        ) : (
          <button type="button" aria-label="View screenshot" onClick={() => setLightboxIndex(index - hasVideo)} className="block w-full">
            <img src={current.url} alt="" className={`${MEDIA_CLASS} cursor-zoom-in`} />
          </button>
        )}
      </motion.div>
      {count > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={() => {
              setDirection(-1);
              setIndex((i) => (i - 1 + count) % count);
            }}
            className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-bg/60 backdrop-blur"
          >
            <ChevronLeft aria-hidden="true" size={18} />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => {
              setDirection(1);
              setIndex((i) => (i + 1) % count);
            }}
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
                onClick={() => {
                  setDirection(i > index ? 1 : -1);
                  setIndex(i);
                }}
                className={`h-2 w-2 rounded-full transition-colors ${i === index ? 'bg-ink' : 'bg-ink/40'}`}
              />
            ))}
          </div>
        </>
      ) : null}
      {lightboxIndex !== null ? (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndex={setLightboxIndex}
        />
      ) : null}
    </div>
  );
}
