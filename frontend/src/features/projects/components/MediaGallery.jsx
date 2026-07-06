import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer.jsx';
import { Lightbox } from './Lightbox.jsx';
import { coverGradient, monogram } from '../cover.js';

const MEDIA_CLASS = 'aspect-[16/10] w-full rounded-media border border-border object-cover';

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
        className="flex aspect-[16/10] w-full items-center justify-center rounded-media border border-border"
        style={{ backgroundImage: coverGradient({ title }) }}
      >
        <span className="font-display text-6xl font-bold text-white/90">{monogram(title)}</span>
      </div>
    );
  }

  const current = slides[index];

  return (
    <div>
      <div
        className="group relative overflow-hidden rounded-media"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
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
              className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-bg/70 text-ink shadow-soft ring-1 ring-border/60 backdrop-blur transition hover:bg-bg md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronLeft aria-hidden="true" size={18} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => {
                setDirection(1);
                setIndex((i) => (i + 1) % count);
              }}
              className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-bg/70 text-ink shadow-soft ring-1 ring-border/60 backdrop-blur transition hover:bg-bg md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronRight aria-hidden="true" size={18} strokeWidth={1.75} />
            </button>
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

      {/* Thumbnail strip — small previews under the carousel; the active slide is
          ringed in accent. Video slide uses its poster with a play glyph. */}
      {count > 1 ? (
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
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
              className={`relative aspect-[16/10] h-16 shrink-0 overflow-hidden rounded-lg ring-2 transition duration-300 ease-apple ${
                i === index ? 'ring-accent' : 'ring-transparent opacity-55 hover:opacity-100'
              }`}
            >
              {s.type === 'image' ? (
                <img src={s.url} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : coverImage?.url ? (
                <img src={coverImage.url} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <span className="block h-full w-full" style={{ backgroundImage: coverGradient({ title }) }} />
              )}
              {s.type === 'video' ? (
                <span className="absolute inset-0 grid place-items-center bg-black/25">
                  <Play aria-hidden="true" size={16} className="text-white" fill="currentColor" />
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
