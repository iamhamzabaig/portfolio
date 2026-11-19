// Illustrations for case-study covers: small, stylised slices of each product's
// real interface, drawn in HTML so they stay crisp and follow the theme. Every
// value shown is illustrative, not live data. Accent colour comes from --tint.

const tint = (a = 1) => `rgb(var(--tint) / ${a})`;

function Window({ children, className = '' }) {
  return (
    <div className={`art-window ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-border px-3.5 py-2.5">
        <span className="h-2 w-2 rounded-full bg-border" />
        <span className="h-2 w-2 rounded-full bg-border" />
        <span className="h-2 w-2 rounded-full bg-border" />
      </div>
      {children}
    </div>
  );
}

function Bar({ w, className = '' }) {
  return <span className={`block h-1.5 rounded-full bg-ink/10 ${className}`} style={{ width: w }} />;
}

// Drop In: doctor booking with live slots and a held payment.
function DropInArt() {
  const slots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
  return (
    <Window className="w-[22rem]">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="art-t11 font-medium text-muted">Book a GP appointment</p>
            <p className="art-t14 font-semibold text-ink">Tue 24 Nov</p>
          </div>
          <span className="rounded-full px-2 py-0.5 art-t10 font-semibold" style={{ background: tint(0.15), color: tint(1) }}>
            6 slots
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {slots.map((s, i) => (
            <span
              key={s}
              className={`rounded-lg py-1.5 text-center art-t11 font-medium ${i === 2 ? 'text-white' : i === 4 ? 'text-muted line-through' : 'text-ink ring-1 ring-border'}`}
              style={i === 2 ? { background: tint(1) } : undefined}
            >
              {s}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-surface px-3 py-2.5">
          <div>
            <p className="art-t10 text-muted">Card held, captured after consult</p>
            <p className="art-t12 font-semibold text-ink">£35.00</p>
          </div>
          <span className="rounded-md bg-ink px-2.5 py-1 art-t10 font-semibold text-bg">Confirm</span>
        </div>
      </div>
    </Window>
  );
}

// Agrius Pulse: monitoring with an uptime chart and an incident.
function PulseArt() {
  const pts = [38, 34, 36, 30, 32, 26, 28, 18, 30, 24, 22, 20, 24, 16, 20, 14];
  const path = pts.map((y, i) => `${i === 0 ? 'M' : 'L'}${i * 20} ${y}`).join(' ');
  return (
    <Window className="w-[23rem]">
      <div className="grid grid-cols-3 gap-2 p-4 pb-2">
        {[
          ['Sites', '42'],
          ['Up', '99.98%'],
          ['Open', '1']
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-surface px-2.5 py-2">
            <p className="art-t10 text-muted">{k}</p>
            <p className="art-t14 font-semibold text-ink">{v}</p>
          </div>
        ))}
      </div>
      <svg viewBox="0 0 300 48" className="h-16 w-full px-4" preserveAspectRatio="none" aria-hidden="true">
        <path d={`${path} L300 48 L0 48Z`} fill={tint(0.14)} />
        <path d={path} fill="none" stroke={tint(1)} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="m-4 mt-2 flex items-center gap-2.5 rounded-xl px-3 py-2.5 ring-1 ring-border">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: tint(1) }} />
        <div className="min-w-0 flex-1">
          <p className="truncate art-t11 font-semibold text-ink">Disk 92% on db-02</p>
          <p className="art-t10 text-muted">Escalated to on-call · 2 min ago</p>
        </div>
        <span className="art-t10 font-semibold text-muted">ACK</span>
      </div>
    </Window>
  );
}

// Asaan Dukaan: a till receipt in paisa-exact rupees, working offline.
function DukaanArt() {
  const lines = [
    ['Galaxy A15 · IMEI ··4821', '42,999'],
    ['Screen guard', '450'],
    ['Back cover', '650']
  ];
  return (
    <div className="art-receipt w-[17rem] rotate-[-3deg]">
      <div className="flex items-center justify-between">
        <p className="art-t12 font-semibold text-ink">Sale #1048</p>
        <span className="flex items-center gap-1 rounded-full px-2 py-0.5 art-t10 font-semibold" style={{ background: tint(0.15), color: tint(1) }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: tint(1) }} />
          Offline
        </span>
      </div>
      <div className="my-3 border-t border-dashed border-ink/20" />
      {lines.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3 py-1 art-t11">
          <span className="text-muted">{k}</span>
          <span className="mono text-ink">{v}</span>
        </div>
      ))}
      <div className="my-3 border-t border-dashed border-ink/20" />
      <div className="flex justify-between art-t12 font-semibold text-ink">
        <span>Total (Rs)</span>
        <span className="mono">44,099.00</span>
      </div>
      <div className="mt-3 flex justify-between art-t10 text-muted">
        <span>Khata: Ali Mobile</span>
        <span>Paid 40,000</span>
      </div>
    </div>
  );
}

// AI Knowledge Assistant: a grounded answer with citations.
function AssistantArt() {
  return (
    <Window className="w-[22rem]">
      <div className="space-y-3 p-4">
        <p className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-ink px-3 py-2 art-t11 text-bg">
          How are answers kept accurate?
        </p>
        <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-surface px-3 py-2.5">
          <p className="art-t11 leading-relaxed text-ink">
            Every answer is retrieved from your own documents and cited. If nothing matches, it says it doesn’t know.
          </p>
          <div className="mt-2 flex gap-1.5">
            {['[1] Grounding', '[2] Search'].map((c) => (
              <span key={c} className="rounded-md px-1.5 py-0.5 art-t10 font-semibold" style={{ background: tint(0.18), color: 'rgb(var(--ink))' }}>
                {c}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 ring-1 ring-border">
          <Bar w="60%" />
          <span className="ml-auto grid h-5 w-5 place-items-center rounded-md art-t10 text-white" style={{ background: tint(1) }}>
            ↑
          </span>
        </div>
      </div>
    </Window>
  );
}

// MediPoint: the layered architecture it is being built on.
function MediPointArt() {
  const layers = ['Renderer · Angular 21', 'Preload API (locked down)', 'Domain · stock movements', 'SQLite · append-only ledger'];
  return (
    <div className="w-[19rem] space-y-2">
      {layers.map((l, i) => (
        <div
          key={l}
          className="art-layer flex items-center justify-between rounded-xl px-4 py-3"
          style={{ marginLeft: `${i * 14}px`, background: i === 1 ? tint(0.16) : undefined }}
        >
          <span className="art-t11 font-semibold text-ink">{l}</span>
          <span className="mono art-t10 text-muted">L{i + 1}</span>
        </div>
      ))}
    </div>
  );
}

function GenericArt() {
  return (
    <Window className="w-[20rem]">
      <div className="space-y-2.5 p-4">
        <Bar w="45%" className="h-2" />
        <Bar w="85%" />
        <Bar w="70%" />
        <div className="grid grid-cols-3 gap-2 pt-2">
          <span className="h-12 rounded-lg" style={{ background: tint(0.18) }} />
          <span className="h-12 rounded-lg bg-surface" />
          <span className="h-12 rounded-lg bg-surface" />
        </div>
      </div>
    </Window>
  );
}

const ART = {
  'drop-in': DropInArt,
  'agrius-pulse': PulseArt,
  'asaan-dukaan': DukaanArt,
  'ai-knowledge-assistant': AssistantArt,
  medipoint: MediPointArt
};

export function ProjectArt({ slug }) {
  const Art = ART[slug] || GenericArt;
  return <Art />;
}

export { DropInArt, PulseArt, DukaanArt, AssistantArt };
