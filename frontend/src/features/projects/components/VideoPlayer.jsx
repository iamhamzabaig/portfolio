import { useState } from 'react';
import { Play } from 'lucide-react';

export function VideoPlayer({ src, poster, onPlayingChange }) {
  const [playing, setPlaying] = useState(false);

  if (!playing) {
    return (
      <button
        type="button"
        aria-label="Play video"
        onClick={() => {
          setPlaying(true);
          onPlayingChange?.(true);
        }}
        className="group grid aspect-[16/10] w-full place-items-center overflow-hidden rounded-2xl border border-border bg-cover bg-center"
        style={poster ? { backgroundImage: `url(${poster})` } : undefined}
      >
        <span className="grid h-16 w-16 place-items-center rounded-full bg-bg/40 backdrop-blur-md transition group-hover:bg-bg/60">
          <Play aria-hidden="true" size={28} className="translate-x-0.5 text-ink" />
        </span>
      </button>
    );
  }

  return (
    <video
      src={src}
      autoPlay
      controls
      onPlay={() => onPlayingChange?.(true)}
      onPause={() => onPlayingChange?.(false)}
      onEnded={() => onPlayingChange?.(false)}
      className="aspect-[16/10] w-full rounded-media border border-border object-cover"
    />
  );
}
