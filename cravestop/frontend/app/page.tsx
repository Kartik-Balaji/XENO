'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Play } from '@/lib/api';
import { MetricsGrid } from '@/components/ui/MetricCard';
import { PlayResultSkeleton } from '@/components/ui/skeleton';
import { showToast } from '@/components/ui/toaster';

const QUICK_PROMPTS = [
  { label: 'Spicy Comeback Window', text: 'Bring back spicy-food customers who haven\'t ordered in 2+ weeks and drive dinner orders tonight.' },
  { label: 'Craving Clock', text: 'Target customers who consistently order in the evening but haven\'t ordered this week. Drive them back tonight.' },
  { label: 'Store Heat Rescue', text: 'Re-engage customers who had bad experience or low ratings but used to order frequently. Win them back with an offer.' },
];

function ChannelBadge({ channel }: { channel: string }) {
  const colors: Record<string, string> = {
    whatsapp: 'bg-green-950 text-green-400',
    sms: 'bg-purple-950 text-purple-400',
    email: 'bg-blue-950 text-blue-400',
    rcs: 'bg-amber-950 text-amber-400',
  };
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded ${colors[channel] ?? 'bg-zinc-800 text-zinc-400'}`}>
      {channel.toUpperCase()}
    </span>
  );
}

function PlayResult({ play }: { play: Play }) {
  const router = useRouter();
  const lf = play.offer_ladder;

  const tierDots = [
    { label: 'Loyal', dot: 'bg-emerald-500', data: lf.loyal_points },
    { label: 'Medium Risk', dot: 'bg-amber-500', data: lf.medium_risk_10 },
    { label: 'High Risk', dot: 'bg-red-500', data: lf.high_risk_15 },
  ];

  const sendTime = new Date(play.recommended_send_time).toLocaleString('en-IN', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
      {/* Left column */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50">{play.play_name}</h1>
          <span className="mt-1 inline-block text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">
            {play.objective}
          </span>
        </div>

        {/* Audience card */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-md p-4 space-y-3">
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Audience</div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <div className="text-zinc-400">Matched</div>
              <div className="text-zinc-50 font-semibold">{play.audience.matched_count}</div>
            </div>
            <div>
              <div className="text-zinc-400">Excluded</div>
              <div className="text-zinc-50 font-semibold">{play.audience.frequency_cap_excluded}</div>
            </div>
            <div>
              <div className="text-zinc-400">Eligible</div>
              <div className="text-orange-500 font-semibold">{play.audience.eligible_count}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {play.audience.rules.map((rule) => (
              <span key={rule} className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded font-mono">
                {rule}
              </span>
            ))}
          </div>
          <div className="text-xs text-zinc-500">
            {play.audience.computed_facts.avg_rhythm_multiplier}x past order rhythm &bull;{' '}
            {play.audience.computed_facts.pct_dinner_period}% dinner period &bull;{' '}
            {play.audience.computed_facts.top_channel} primary
          </div>
        </div>

        {/* Reasoning card */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-md p-4 space-y-2">
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
            <span className="text-orange-500">✦</span> AI Reasoning
          </div>
          <p className="text-sm text-zinc-300 italic leading-relaxed">{play.reasoning}</p>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {/* Offer Ladder */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-md p-4 space-y-3">
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Offer Ladder</div>
          <div className="space-y-2.5">
            {tierDots.map((t) => (
              <div key={t.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${t.dot}`} />
                  <span className="text-zinc-300 font-medium">{t.label}</span>
                  <span className="text-zinc-500 text-xs">({t.data.count} customers)</span>
                </div>
                <span className="text-zinc-400 text-xs bg-zinc-800 px-2 py-0.5 rounded">{t.data.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Channel & Send Time */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-md p-4 space-y-3">
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Channel & Send Time</div>
          <div className="flex flex-wrap gap-2">
            {play.recommended_channels.map((ch) => (
              <ChannelBadge key={ch} channel={ch} />
            ))}
          </div>
          <div className="text-sm text-zinc-300">{sendTime}</div>
        </div>

        {/* Predicted Metrics */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-md p-4 space-y-3">
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Predicted Metrics</div>
          <MetricsGrid predicted={play.predicted} />
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push(`/review/${play.play_id}`)}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-150 text-sm"
        >
          Review Play →
        </button>
      </div>
    </div>
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
    <div className="min-h-full p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-50">Growth Kitchen</h1>
        <p className="text-sm text-zinc-500 mt-1">Describe a campaign goal and the AI will build the play.</p>
      </div>

      {/* Input area */}
      <div className="mb-6 space-y-3">
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
          }}
          placeholder="e.g. Bring back spicy-food customers who haven't ordered recently and drive dinner orders tonight."
          rows={3}
          className="w-full bg-[#18181b] border border-zinc-700 rounded-md px-4 py-3 text-sm text-zinc-50 placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors resize-none"
        />
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.label}
                onClick={() => setGoal(p.text)}
                className="text-xs px-3 py-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 border border-zinc-700 transition-colors duration-150 font-medium"
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !goal.trim()}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-2 px-5 rounded-md transition-colors duration-150 text-sm whitespace-nowrap ml-4"
          >
            {loading ? 'Generating…' : 'Generate Play →'}
          </button>
        </div>
      </div>

      {/* Results */}
      {loading && <PlayResultSkeleton />}
      {!loading && play && <PlayResult play={play} />}
    </div>
  );
}
