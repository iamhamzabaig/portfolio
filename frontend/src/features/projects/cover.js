// Deterministic on-brand gradient covers + monogram, shared by ProjectCard and
// ProjectDetail so a project always renders the same stand-in when it has no image.
const gradients = [
  'linear-gradient(135deg, #1a1740 0%, #3a2c7a 55%, #7c6cf2 120%)',
  'linear-gradient(135deg, #101826 0%, #1f3a52 55%, #34d3c6 130%)',
  'linear-gradient(135deg, #221033 0%, #4a1d63 55%, #b07cf2 130%)',
  'linear-gradient(135deg, #0f1a14 0%, #1f3a2c 55%, #5fd39a 130%)',
  'linear-gradient(135deg, #2a1326 0%, #5a2342 55%, #f3789f 130%)'
];

const hash = (s) => s.split('').reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);

export const coverGradient = (project) =>
  gradients[hash(project.slug || project.title || '') % gradients.length];

export const monogram = (title = '') =>
  title
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
