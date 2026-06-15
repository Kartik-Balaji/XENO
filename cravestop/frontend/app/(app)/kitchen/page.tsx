'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api, Play } from '@/lib/api';
import { showToast } from '@/components/ui/toaster';
import { TopBar } from '@/components/TopBar';

const QUICK_PROMPTS = [
  { label: '🌶 Spicy Comeback Window', text: "Bring back spicy-food customers who haven't ordered in 2+ weeks and drive dinner orders tonight." },
  { label: '🕐 Craving Clock', text: "Target customers who consistently order in the evening but haven't ordered this week. Drive them back tonight." },
  { label: '🔥 Store Heat Rescue', text: 'Re-engage customers who had bad experience or low ratings but used to order frequently. Win them back with an offer.' },
];

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`bg-[#E8E0D0] animate-pulse rounded-lg ${className ?? ''}`} />;
}

function PlayResultSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-4 space-y-3">
        <SkeletonBlock className="h-40" />
        <SkeletonBlock className="h-32" />
      </div>
      <div className="col-span-8 space-y-3">
        <SkeletonBlock className="h-36" />
        <div className="grid grid-cols-2 gap-3">
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-[#6B5D52]">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${accent ? 'text-[#D95F2B]' : 'text-[#1A1410]'}`}>
        {value}
      </span>
    </div>
  );
}

function PlayResult({ play, onAdjust }: { play: Play; onAdjust: () => void }) {
  const router = useRouter();
  const lf = play.offer_ladder;

  const tierRows = [
    { label: 'Loyal', bar: 'bg-[#2E7D52]', data: lf.loyal_points },
    { label: 'Medium Risk', bar: 'bg-[#A0660A]', data: lf.medium_risk_10 },
    { label: 'High Risk', bar: 'bg-[#C0392B]', data: lf.high_risk_15 },
  ];

  const eligiblePct = play.audience.matched_count > 0
    ? Math.round((play.audience.eligible_count / play.audience.matched_count) * 100)
    : 0;

  const sendTime = new Date(play.recommended_send_time).toLocaleString('en-IN', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const impactStats = [
    { label: 'Messages', value: play.predicted.messages_to_send.toLocaleString('en-IN') },
    { label: 'Delivered', value: play.predicted.delivered.toLocaleString('en-IN') },
    { label: 'Read', value: play.predicted.read_or_opened.toLocaleString('en-IN') },
    { label: 'Clicked', value: play.predicted.clicked.toLocaleString('en-IN') },
    { label: 'Orders', value: play.predicted.orders.toLocaleString('en-IN') },
    { label: 'Revenue', value: `₹${play.predicted.revenue.toLocaleString('en-IN')}`, accent: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-5"
    >
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-[#1A1410]">{play.play_name}</h2>
        <span className="text-xs bg-[#F5F0E8] text-[#6B5D52] px-2 py-0.5 rounded font-mono border border-[#E8E0D0]">
          {play.objective}
        </span>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-4 bg-white border border-[#E8E0D0] rounded-xl shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#D95F2B]" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
            <span className="text-xs font-medium uppercase tracking-widest text-[#6B5D52]">Audience</span>
          </div>
          <div className="font-semibold text-[#1A1410] text-sm">{play.audience.segment_name}</div>
          <div className="divide-y divide-[#E8E0D0]">
            <StatRow label="Matched" value={play.audience.matched_count.toLocaleString('en-IN')} />
            <StatRow label="Excluded (freq cap)" value={play.audience.frequency_cap_excluded.toLocaleString('en-IN')} />
            <StatRow label="Eligible" value={play.audience.eligible_count.toLocaleString('en-IN')} accent />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#A89880]">
              <span>Eligible rate</span>
              <span className="font-semibold">{eligiblePct}%</span>
            </div>
            <div className="h-1.5 bg-[#F5F0E8] rounded-full overflow-hidden">
              <div className="h-full bg-[#D95F2B] rounded-full transition-all duration-700" style={{ width: `${eligiblePct}%` }} />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {play.audience.rules.map((rule) => (
              <span key={rule} className="bg-[#F5F0E8] font-mono text-xs px-2 py-0.5 rounded text-[#6B5D52] border border-[#E8E0D0]">
                {rule}
              </span>
            ))}
          </div>
          <p className="text-xs text-[#A89880] leading-relaxed">
            {play.audience.computed_facts.avg_rhythm_multiplier}x order rhythm &bull;{' '}
            {play.audience.computed_facts.pct_dinner_period}% dinner &bull;{' '}
            {play.audience.computed_facts.top_channel} primary
          </p>
        </div>

        <div className="col-span-8 space-y-4">
          <div className="bg-white border border-[#E8E0D0] rounded-xl shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#D95F2B]" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
              <span className="text-xs font-medium uppercase tracking-widest text-[#6B5D52]">AI Reasoning</span>
              <span className="ml-auto text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-[#E6F4EC] text-[#2E7D52] border border-[#2E7D52]/20">Groq AI</span>
            </div>
            <p className="text-sm text-[#6B5D52] italic leading-relaxed">{play.reasoning}</p>
            <div className="bg-[#F5F0E8] rounded-lg px-4 py-3 flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px] text-[#D95F2B]">schedule</span>
              <div>
                <div className="text-xs font-medium text-[#6B5D52]">Optimal Send Time</div>
                <div className="text-sm font-semibold text-[#1A1410]">{sendTime}</div>
              </div>
              <div className="ml-auto flex flex-wrap gap-1.5">
                {play.recommended_channels.map((ch) => (
                  <span key={ch} className="text-xs bg-white border border-[#E8E0D0] text-[#6B5D52] px-2 py-0.5 rounded font-medium uppercase">{ch}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-[#E8E0D0] rounded-xl shadow-sm p-5 space-y-3">
              <div className="text-xs font-medium uppercase tracking-widest text-[#6B5D52]">Offer Ladder</div>
              <div className="space-y-2.5">
                {tierRows.map((t) => (
                  <div key={t.label} className="flex items-center gap-3">
                    <div className={`w-1 h-8 rounded-full ${t.bar} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-[#1A1410]">{t.label}</div>
                      <div className="text-xs text-[#A89880]">{t.data.label}</div>
                    </div>
                    <span className="text-xs font-semibold tabular-nums bg-[#F5F0E8] px-2 py-0.5 rounded text-[#6B5D52] border border-[#E8E0D0]">
                      {t.data.count.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-[#E8E0D0] rounded-xl shadow-sm p-5 space-y-3">
              <div className="text-xs font-medium uppercase tracking-widest text-[#6B5D52]">Predicted Impact</div>
              <div className="grid grid-cols-2 gap-2">
                {impactStats.map((s) => (
                  <div key={s.label} className={`bg-[#FAF7F2] rounded-lg p-2.5 text-center ${s.accent ? 'border border-[#D95F2B]/40' : 'border border-[#E8E0D0]'}`}>
                    <div className="text-xs text-[#A89880]">{s.label}</div>
                    <div className={`text-sm font-semibold tabular-nums mt-0.5 ${s.accent ? 'text-[#D95F2B]' : 'text-[#1A1410]'}`}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E8E0D0]">
        <button
          onClick={onAdjust}
          className="border border-[#D95F2B] text-[#D95F2B] hover:bg-[#F5E6DC] text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          Adjust Parameters
        </button>
        <button
          onClick={() => router.push(`/review/${play.play_id}`)}
          className="bg-[#D95F2B] hover:bg-[#C4501F] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
          Review &amp; Launch Play →
        </button>
      </div>
    </motion.div>
  );
}

export default function GrowthKitchenPage() {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [play, setPlay] = useState<Play | null>(null);

  async function handleGenerate() {
    if (!goal.trim()) return;
    setLoading(true);
    setPlay(null);
    try {
      const result = await api.generatePlay(goal);
      setPlay(result);
    } catch (err) {
      showToast(`Failed to generate play: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full">
      <TopBar title="Growth Kitchen" subtitle="Describe a goal and AI will build the play" />
      <div className="p-8 space-y-6">
        <div className="bg-white border border-[#E8E0D0] rounded-xl shadow-sm p-5 space-y-4 focus-within:ring-2 focus-within:ring-[#D95F2B]/30 focus-within:border-[#D95F2B] transition-all">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#D95F2B]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span className="text-sm font-semibold text-[#1A1410]">Describe your campaign goal</span>
          </div>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
            placeholder="e.g. Bring back spicy-food customers who haven't ordered recently and drive dinner orders tonight."
            rows={3}
            className="w-full bg-[#FAF7F2] border border-[#E8E0D0] rounded-lg px-4 py-3 text-sm text-[#1A1410] placeholder-[#A89880] focus:outline-none focus:border-[#D95F2B] focus:ring-2 focus:ring-[#D95F2B]/20 transition-colors resize-none"
          />
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((p) => (
                <button key={p.label} onClick={() => setGoal(p.text)} className="text-xs px-3 py-1.5 rounded-full bg-[#F5F0E8] text-[#6B5D52] hover:text-[#1A1410] hover:bg-[#E8E0D0] border border-[#E8E0D0] transition-colors font-medium">
                  {p.label}
                </button>
              ))}
            </div>
            <button onClick={handleGenerate} disabled={loading || !goal.trim()} className="bg-[#D95F2B] hover:bg-[#C4501F] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2 px-5 rounded-lg transition-colors text-sm whitespace-nowrap flex items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              {loading ? 'Generating…' : 'Generate Play →'}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <PlayResultSkeleton />
            </motion.div>
          )}
          {!loading && play && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <PlayResult play={play} onAdjust={() => { setPlay(null); setGoal(''); }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
