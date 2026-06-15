'use client';

import Link from 'next/link';
import { useState } from 'react';

const FEATURES = [
  {
    tag: 'STRATEGY',
    title: 'AI Play Copilot',
    body: 'A real campaign recommendation anchored in craving timing, churn risk, and store context.',
  },
  {
    tag: 'MARGIN GUARD',
    title: 'Offer Ladder',
    body: 'Personalized incentives escalate only when the customer risk justifies the cost.',
  },
  {
    tag: 'CALLBACK PROOF',
    title: 'Send Monitor',
    body: 'Async sends, retries, out-of-order receipts, and idempotent status changes stay visible.',
  },
  {
    tag: 'LEARNING',
    title: 'Performance Kitchen',
    body: 'Results close the loop with next-play learnings instead of stopping at message copy.',
  },
];

const STATS = [
  { value: '500', label: 'CUSTOMERS' },
  { value: '3k', label: 'ORDERS' },
  { value: '4', label: 'PROOF LOOPS' },
];

export default function LandingPage() {
  const [pressed, setPressed] = useState(false);

  return (
    <main
      className="min-h-screen w-full"
      style={{ backgroundColor: '#EDE8DF', fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      {/* ── Top nav ── */}
      <nav className="flex items-center justify-between px-10 py-6">
        <span
          className="text-xs font-bold tracking-[0.2em] uppercase"
          style={{ fontFamily: 'monospace', color: '#1A1410' }}
        >
          CRAVESTOP
        </span>
        <span
          className="text-xs font-bold tracking-[0.2em] uppercase"
          style={{ fontFamily: 'monospace', color: '#C0392B' }}
        >
          URBANBITE DEMO
        </span>
      </nav>

      {/* ── Hero + feature grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 px-10 pb-10">

        {/* LEFT — headline + cta */}
        <div className="flex flex-col justify-center pr-0 lg:pr-16 pt-8 lg:pt-16 pb-10">
          {/* Tag */}
          <div
            className="inline-block self-start border px-3 py-1 text-xs font-bold tracking-[0.18em] uppercase mb-8"
            style={{ borderColor: '#1A1410', color: '#1A1410', fontFamily: 'monospace' }}
          >
            GROWTH KITCHEN LIVE
          </div>

          {/* Headline */}
          <h1
            className="text-[clamp(52px,8vw,88px)] font-black leading-[0.92] tracking-tight mb-6"
            style={{ color: '#1A1410' }}
          >
            Spicy<br />
            Comeback<br />
            Window
          </h1>

          {/* Subtext */}
          <p
            className="text-[15px] leading-relaxed mb-10 max-w-sm"
            style={{ color: '#1A1410' }}
          >
            CraveStop turns lapsed QSR customers into timed,&nbsp;
            <span style={{ color: '#C0392B' }}>margin-aware plays</span> with AI reasoning,&nbsp;
            <span style={{ color: '#C0392B' }}>personalized offer ladders</span>, delivery receipts,
            and a <span style={{ color: '#C0392B' }}>learning loop</span>.
          </p>

          {/* ── 3D Retro Tactile Button ── */}
          <div className="self-start">
            <Link href="/kitchen" legacyBehavior>
              <a
                onMouseDown={() => setPressed(true)}
                onMouseUp={() => setPressed(false)}
                onMouseLeave={() => setPressed(false)}
                style={{
                  display: 'inline-block',
                  position: 'relative',
                  backgroundColor: '#C0392B',
                  color: '#FAF7F2',
                  fontFamily: 'monospace',
                  fontWeight: 800,
                  fontSize: '13px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  padding: '14px 32px',
                  border: '2px solid #8B1A0F',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  // 3D bottom-right shadow = the "depth" slab
                  boxShadow: pressed
                    ? '1px 1px 0 #8B1A0F, 2px 2px 0 #8B1A0F'
                    : '3px 3px 0 #8B1A0F, 6px 6px 0 #6B1208',
                  transform: pressed ? 'translate(3px, 3px)' : 'translate(0, 0)',
                  transition: 'box-shadow 80ms ease, transform 80ms ease',
                  textDecoration: 'none',
                }}
              >
                Enter Growth Kitchen →
              </a>
            </Link>
          </div>
        </div>

        {/* RIGHT — bento feature grid + milestone card */}
        <div className="flex flex-col gap-4 pt-8 lg:pt-16">

          {/* 2×2 feature cards */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <div
                key={f.tag}
                style={{
                  backgroundColor: '#F5F0E6',
                  border: '1.5px solid #D4C9B0',
                  borderRadius: '2px',
                  padding: '20px',
                }}
              >
                <div
                  className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2"
                  style={{ color: '#C0392B', fontFamily: 'monospace' }}
                >
                  {f.tag}
                </div>
                <div
                  className="text-[18px] font-black leading-tight mb-2"
                  style={{ color: '#1A1410' }}
                >
                  {f.title}
                </div>
                <div
                  className="text-[12px] leading-relaxed"
                  style={{ color: '#5C4F42', fontFamily: 'sans-serif', fontWeight: 400 }}
                >
                  {f.body}
                </div>
              </div>
            ))}
          </div>

          {/* Milestone card */}
          <div
            style={{
              backgroundColor: '#F5F0E6',
              border: '1.5px solid #D4C9B0',
              borderRadius: '2px',
              padding: '20px',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="text-[10px] font-bold tracking-[0.2em] uppercase"
                style={{ color: '#1A1410', fontFamily: 'monospace' }}
              >
                NEXT MILESTONE
              </div>
              <div
                style={{
                  backgroundColor: '#C0392B',
                  color: '#FAF7F2',
                  fontFamily: 'monospace',
                  fontWeight: 800,
                  fontSize: '10px',
                  letterSpacing: '0.15em',
                  padding: '3px 10px',
                  border: '1.5px solid #8B1A0F',
                  boxShadow: '2px 2px 0 #8B1A0F',
                }}
              >
                READY
              </div>
            </div>
            <div
              className="text-[17px] font-black mb-4"
              style={{ color: '#1A1410' }}
            >
              Build the playable CRM loop
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                '1. Copilot play generation',
                '2. Channel simulator callback',
                '3. Monitor + performance loop',
              ].map((step, i) => (
                <div key={i} className="text-[12px]" style={{ fontFamily: 'sans-serif' }}>
                  <span style={{ color: '#C0392B' }}>{step.split('.')[0]}.</span>
                  <span style={{ color: '#1A1410' }}>{step.split('.').slice(1).join('.')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ borderTop: '1.5px solid #C8BFA8', marginLeft: 40, marginRight: 40 }} />

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 divide-x" style={{ borderColor: '#C8BFA8' }}>
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className="py-8 flex flex-col items-center justify-center"
            style={{ borderColor: '#C8BFA8', borderRight: i < 2 ? '1.5px solid #C8BFA8' : 'none' }}
          >
            <span
              className="text-[48px] font-black leading-none"
              style={{ color: '#C0392B' }}
            >
              {s.value}
            </span>
            <span
              className="text-[10px] font-bold tracking-[0.22em] uppercase mt-1"
              style={{ color: '#1A1410', fontFamily: 'monospace' }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
