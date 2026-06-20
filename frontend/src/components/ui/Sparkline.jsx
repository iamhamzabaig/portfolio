// Tiny inline sparkline for the stats band. `points` is an array of y-values
// (0 = bottom, 10 = top); it scales to the given width/height. Decorative, so
// it is aria-hidden — the number and label carry the meaning.
export function Sparkline({ points = [], width = 92, height = 26, className = '' }) {
  if (points.length < 2) return null;
  const max = 10;
  const stepX = width / (points.length - 1);
  const coords = points.map((y, i) => {
    const px = i * stepX;
    const py = height - (Math.max(0, Math.min(max, y)) / max) * height;
    return `${px.toFixed(1)},${py.toFixed(1)}`;
  });

  return (
    <svg
      aria-hidden="true"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      fill="none"
    >
      <polyline
        points={coords.join(' ')}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={coords[coords.length - 1].split(',')[0]}
        cy={coords[coords.length - 1].split(',')[1]}
        r="2"
        fill="currentColor"
      />
    </svg>
  );
}
