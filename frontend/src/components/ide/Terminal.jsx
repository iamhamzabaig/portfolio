import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complete, run } from './terminal/commands.js';

const SCRIPT = ['whoami', 'cat headline.txt', 'ls projects', 'help'];
const CHIPS = ['help', 'ls projects', 'about', 'contact', 'sudo hire-me'];
const TYPE_MS = 45;
const PAUSE_MS = 450;

function Prompt() {
  return (
    <span aria-hidden="true" className="shrink-0">
      <span className="syn-string">hamza</span>
      <span className="text-muted">@</span>
      <span className="syn-fn">portfolio</span> <span className="syn-keyword">~</span>
      <span className="text-muted">{' $ '}</span>
    </span>
  );
}

function Line({ tokens }) {
  return (
    <div className="whitespace-pre-wrap break-words">
      {tokens.map(([kind, text], i) => <span key={i} className={`syn-${kind}`}>{text}</span>)}
    </div>
  );
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Hero terminal: types a short intro, then takes commands. With reduced
// motion (or animate={false}) the intro renders at once.
export function Terminal({ profile, projects = [], resumeUrl, animate }) {
  const navigate = useNavigate();
  const ctx = { profile, projects, resumeUrl };
  const shouldAnimate = animate ?? !prefersReducedMotion();
  const [entries, setEntries] = useState(() =>
    shouldAnimate ? [] : SCRIPT.map((cmd) => ({ cmd, lines: run(cmd, ctx).lines }))
  );
  const [typing, setTyping] = useState(shouldAnimate ? '' : null); // null = intro done
  const [value, setValue] = useState('');
  const [history, setHistory] = useState([]);
  const [cursor, setCursor] = useState(-1);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  // Scripted intro. Any key the visitor presses skips straight to the end.
  useEffect(() => {
    if (!shouldAnimate) return undefined;
    let cancelled = false;
    const timers = [];
    const wait = (ms) => new Promise((r) => timers.push(setTimeout(r, ms)));
    (async () => {
      await wait(500);
      for (const cmd of SCRIPT) {
        for (let i = 1; i <= cmd.length; i += 1) {
          if (cancelled) return;
          setTyping(cmd.slice(0, i));
          await wait(TYPE_MS);
        }
        if (cancelled) return;
        setEntries((e) => [...e, { cmd, lines: run(cmd, ctxRef.current).lines }]);
        setTyping('');
        await wait(PAUSE_MS);
      }
      if (!cancelled) setTyping(null);
    })();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [shouldAnimate]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries, typing]);

  const skipIntro = () => {
    if (typing === null) return;
    setTyping(null);
    setEntries(SCRIPT.map((cmd) => ({ cmd, lines: run(cmd, ctxRef.current).lines })));
  };

  const exec = (input) => {
    skipIntro();
    const result = run(input, ctx);
    if (input.trim()) setHistory((h) => [...h, input]);
    setCursor(-1);
    setValue('');
    if (result.clear) setEntries([]);
    else setEntries((e) => [...e, { cmd: input, lines: result.lines }]);
    if (result.href) window.open(result.href, '_blank', 'noopener');
    if (result.navigate) setTimeout(() => navigate(result.navigate), 350);
  };

  const onKeyDown = (e) => {
    skipIntro();
    if (e.key === 'Tab') {
      e.preventDefault();
      setValue((v) => complete(v, ctx));
    } else if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      const next = cursor < 0 ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setValue(history[next]);
    } else if (e.key === 'ArrowDown' && cursor >= 0) {
      e.preventDefault();
      const next = cursor + 1;
      setCursor(next >= history.length ? -1 : next);
      setValue(next >= history.length ? '' : history[next]);
    }
  };

  return (
    <div className="overflow-hidden rounded-card bg-panel font-mono text-caption shadow-overlay ring-1 ring-border">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#f7768e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#e0af68]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#9ece6a]" />
        </span>
        <span className="ml-2 text-muted">zsh — terminal</span>
      </div>

      {/* Clicking anywhere in the output focuses the prompt, like a real terminal. */}
      <div
        ref={scrollRef}
        onClick={() => {
          skipIntro();
          setTimeout(() => inputRef.current?.focus({ preventScroll: true }));
        }}
        className="h-80 overflow-y-auto p-4 sm:h-96"
      >
        <div role="log" aria-live="polite" aria-label="Terminal output" className="space-y-1">
          {entries.map((entry, i) => (
            <div key={i} className="space-y-0.5">
              <div className="flex"><Prompt /><span className="text-ink">{entry.cmd}</span></div>
              {entry.lines.map((tokens, j) => <Line key={j} tokens={tokens} />)}
            </div>
          ))}
        </div>
        {typing !== null ? (
          <div aria-hidden="true" className="mt-1 flex">
            <Prompt />
            <span className="text-ink">{typing}</span>
            <span className="caret" />
          </div>
        ) : (
          <form
            className="mt-1 flex"
            onSubmit={(e) => {
              e.preventDefault();
              exec(value);
            }}
          >
            <Prompt />
            <label htmlFor="term-input" className="sr-only">Terminal command</label>
            <input
              id="term-input"
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className="term-input"
            />
          </form>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 border-t border-border px-3 py-2.5">
        {CHIPS.map((cmd) => (
          <button
            key={cmd}
            type="button"
            onClick={() => exec(cmd)}
            className="rounded-control px-2.5 py-1 text-muted ring-1 ring-border transition-colors hover:text-ink hover:ring-accent"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
