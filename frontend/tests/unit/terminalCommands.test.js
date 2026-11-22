import { describe, expect, it } from 'vitest';
import { complete, run } from '../../src/components/ide/terminal/commands.js';

const ctx = {
  profile: { name: 'Hamza', role: 'Engineer', headline: 'Builds things.' },
  projects: [{ slug: 'drop-in', title: 'Drop In' }, { slug: 'asaan-dukaan', title: 'Asaan Dukaan' }],
  resumeUrl: 'https://cdn/resume.pdf'
};
const text = (lines) => lines.map((l) => l.map(([, t]) => t).join('')).join('\n');

describe('terminal commands', () => {
  it('prints identity and headline', () => {
    expect(text(run('whoami', ctx).lines)).toContain('Hamza');
    expect(text(run('cat headline.txt', ctx).lines)).toBe('Builds things.');
  });

  it('lists project slugs', () => {
    expect(text(run('ls projects', ctx).lines)).toMatch(/drop-in.*asaan-dukaan/);
  });

  it('opens projects and pages by name', () => {
    expect(run('open drop-in', ctx).navigate).toBe('/projects/drop-in');
    expect(run('cd about.md', ctx).navigate).toBe('/about');
    expect(run('contact', ctx).navigate).toBe('/contact');
    expect(run('sudo hire-me', ctx).navigate).toBe('/contact');
  });

  it('reports unknown commands and targets', () => {
    expect(text(run('rm -rf /', ctx).lines)).toMatch(/command not found: rm/);
    expect(run('open nope', ctx).navigate).toBeUndefined();
  });

  it('handles resume and clear', () => {
    expect(run('resume', ctx).href).toBe('https://cdn/resume.pdf');
    expect(run('resume', { ...ctx, resumeUrl: undefined }).href).toBeUndefined();
    expect(run('clear', ctx).clear).toBe(true);
  });

  it('tab-completes commands and slugs', () => {
    expect(complete('wh', ctx)).toBe('whoami ');
    expect(complete('open dr', ctx)).toBe('open drop-in');
    expect(complete('open a', ctx)).toBe('open a'); // ambiguous: about, asaan-dukaan
    expect(complete('sudo h', ctx)).toBe('sudo hire-me');
  });
});
