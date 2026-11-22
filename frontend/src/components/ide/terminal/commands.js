// The hero terminal's command set. Pure: run() returns output lines plus any
// side effect (navigate, href, clear) for the component to perform.
// A line is an array of [kind, text] tokens, kinds as in CodeBlock.

const PAGES = { projects: '/projects', blog: '/blog', about: '/about', contact: '/contact', home: '/' };

export const COMMANDS = {
  help: 'list commands',
  whoami: 'who built this',
  'ls projects': 'list projects',
  'open <name>': 'open a project or page',
  about: 'open about.md',
  projects: 'open projects.json',
  blog: 'open the blog',
  contact: 'open contact.sh',
  resume: 'download resume.pdf',
  clear: 'clear the screen',
  'sudo hire-me': 'you know you want to'
};

const err = (text) => ({ lines: [[['error', text]]] });

export function run(input, ctx = {}) {
  const { profile = {}, projects = [], resumeUrl } = ctx;
  const [cmd = '', ...args] = input.trim().split(/\s+/);
  const arg = args.join(' ').replace(/\/$/, '');

  switch (cmd) {
    case '':
      return { lines: [] };
    case 'help':
      return {
        lines: Object.entries(COMMANDS).map(([name, desc]) => [['fn', name.padEnd(14)], ['comment', desc]])
      };
    case 'whoami':
      return { lines: [[['string', profile.name || 'Hamza Munawar'], ['plain', ' — '], ['type', profile.role || 'Full-Stack & AI Engineer']]] };
    case 'cat':
      if (arg === 'headline.txt') return { lines: [[['plain', profile.headline || '']]] };
      return err(`cat: ${arg || '?'}: No such file`);
    case 'ls':
      if (!arg || arg === 'projects' || arg === '.') {
        return { lines: [projects.map((p) => ['type', `${p.slug}  `])] };
      }
      return err(`ls: ${arg}: No such directory`);
    case 'open':
    case 'cd': {
      if (!arg || arg === '~') return { lines: [], navigate: '/' };
      const name = arg.replace(/\.(md|json|sh|tsx)$/, '').replace(/^projects\//, '');
      if (PAGES[name]) return { lines: [[['comment', `opening ${name}…`]]], navigate: PAGES[name] };
      const project = projects.find((p) => p.slug === name);
      if (project) return { lines: [[['comment', `opening ${project.title || project.slug}…`]]], navigate: `/projects/${project.slug}` };
      return err(`${cmd}: ${arg}: not found. Try: ls projects`);
    }
    case 'about':
    case 'projects':
    case 'blog':
    case 'contact':
    case 'home':
      return { lines: [[['comment', `opening ${cmd}…`]]], navigate: PAGES[cmd] };
    case 'resume':
      return resumeUrl
        ? { lines: [[['comment', 'opening resume.pdf…']]], href: resumeUrl }
        : err('resume: not uploaded yet. Try: contact');
    case 'clear':
      return { lines: [], clear: true };
    case 'sudo':
      if (arg === 'hire-me') {
        return { lines: [[['string', '[sudo] access granted.'], ['plain', ' Redirecting to contact.sh…']]], navigate: '/contact' };
      }
      return err('sudo: nice try.');
    case 'hire-me':
      return err('permission denied. Try: sudo hire-me');
    default:
      return err(`command not found: ${cmd}. Try: help`);
  }
}

// Tab completion: command names first, then project slugs after open/cd.
export function complete(input, ctx = {}) {
  const parts = input.split(' ');
  const pool =
    parts.length === 1
      ? ['help', 'whoami', 'ls', 'open', 'about', 'projects', 'blog', 'contact', 'resume', 'clear', 'sudo']
      : ['open', 'cd'].includes(parts[0])
        ? [...Object.keys(PAGES), ...(ctx.projects || []).map((p) => p.slug)]
        : parts[0] === 'sudo'
          ? ['hire-me']
          : [];
  const last = parts[parts.length - 1];
  const hits = pool.filter((word) => word.startsWith(last));
  if (hits.length !== 1) return input;
  return [...parts.slice(0, -1), hits[0]].join(' ') + (parts.length === 1 ? ' ' : '');
}
