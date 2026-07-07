import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Typography contract — the public UI must size text through the semantic tokens
// defined in tailwind.config.js (text-fluid-*, text-body*, text-caption,
// text-micro, text-eyebrow), never raw Tailwind sizes or arbitrary pixels. This
// keeps every heading/label/body on one deliberate scale and stops raw sizes
// (text-xl, text-[11px]) creeping back in future work.
//
// Two escape hatches:
//   • ALLOWLIST — admin/internal surfaces are out of scope for now.
//   • `type-exempt` — a genuinely decorative glyph (a monogram or a stat suffix
//     optically sized to its numeral) may keep a raw size if the class line, or
//     the line directly above it, carries a `type-exempt` marker comment.

const SRC = resolve(process.cwd(), 'src');

// Raw physical scale (text-xs … text-9xl) and arbitrary px/rem/em sizes. These
// patterns do NOT match the tokens: `text-body-lg`, `text-body-sm`,
// `text-fluid-*`, `text-caption`, `text-micro`, `text-eyebrow`, nor color
// utilities like `text-ink` / `text-accent`.
const BANNED = [
  /\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/,
  /text-\[[0-9.]+(px|rem|em)\]/
];

// Out of scope: admin/internal pages and the admin-only project editor form.
// TEMP: Navbar/Footer/ProjectFeature are migrated in the working tree but their
// edits are entangled with a separate in-progress nav/PWA changeset, so they land
// with that branch. Remove these three entries once that work is committed.
const ALLOWLIST = [
  /[\\/]pages[\\/]admin[\\/]/,
  /ProjectForm\.jsx$/,
  /[\\/]layout[\\/]Navbar\.jsx$/,
  /[\\/]layout[\\/]Footer\.jsx$/,
  /ProjectFeature\.jsx$/
];

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = `${dir}/${entry.name}`;
    if (entry.isDirectory()) files.push(...walk(full));
    else if (/\.(jsx|js)$/.test(entry.name)) files.push(full);
  }
  return files;
}

describe('typography contract', () => {
  it('public UI sizes text through semantic tokens only', () => {
    const offenders = [];

    for (const file of walk(SRC)) {
      if (ALLOWLIST.some((re) => re.test(file))) continue;
      const lines = readFileSync(file, 'utf8').split('\n');

      lines.forEach((line, i) => {
        if (!BANNED.some((re) => re.test(line))) return;
        // Decorative escape: marker on this line or the one directly above it.
        const prev = lines[i - 1] || '';
        if (line.includes('type-exempt') || prev.includes('type-exempt')) return;
        const rel = file.slice(SRC.length + 1);
        offenders.push(`${rel}:${i + 1}  ${line.trim()}`);
      });
    }

    expect(
      offenders,
      `Raw font sizes found — use a semantic token (text-fluid-*, text-body*, ` +
        `text-caption, text-micro, text-eyebrow) or mark a decorative glyph with ` +
        `a \`type-exempt\` comment:\n${offenders.join('\n')}`
    ).toEqual([]);
  });
});
