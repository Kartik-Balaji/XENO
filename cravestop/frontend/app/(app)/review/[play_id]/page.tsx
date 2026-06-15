'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api, Play } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MetricsGrid } from '@/components/ui/MetricCard';
import { PlayResultSkeleton } from '@/components/ui/skeleton';
import { showToast } from '@/components/ui/toaster';

const PLACEHOLDER_NAMES: Record<string, string> = {
  loyal: 'Priya',
  medium: 'Aman',
  high_risk: 'Naina',
};

const PLACEHOLDER_ITEM = 'Volcano Burrito';

function fillTemplate(template: string, name: string) {
  return template
    .replace(/{first_name}/g, name)
    .replace(/{favorite_item}/g, PLACEHOLDER_ITEM);
}

export default function PlayReviewPage() {
  const params = useParams();
  const playId = params.play_id as string;
  const router = useRouter();

  const [play, setPlay] = useState<Play | null>(null);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    api.getPlay(playId)
      .then(setPlay)
      .catch((err) => showToast(`Failed to load play: ${err.message}`, 'error'))
      .finally(() => setLoading(false));
  }, [playId]);

  async function handleLaunch() {
    if (!play) return;
    setLaunching(true);
    try {
      const campaign = await api.createCampaignFromPlay(play.play_id);
      await api.launchCampaign(campaign.campaign_id);
      showToast('Campaign launched successfully! 🚀', 'success');
      setTimeout(() => router.push(`/monitor/${campaign.campaign_id}`), 1000);
    } catch (err) {
      showToast(`Launch failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
      setLaunching(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-6 h-5 w-24 bg-zinc-800 animate-pulse rounded" />
        <PlayResultSkeleton />
      </div>
    );
  }

  if (!play) {
    return (
      <div className="p-8 text-zinc-400">
        Play not found. <Link href="/" className="text-orange-500 hover:underline">Go back to Kitchen</Link>
      </div>
    );
  }

  const tiers = [
    { key: 'loyal', label: 'Loyal', dot: 'bg-emerald-500', borderTop: 'border-t-emerald-500', data: play.offer_ladder.loyal_points, msg: play.message_variants.loyal },
    { key: 'medium', label: 'Medium Risk', dot: 'bg-amber-500', borderTop: 'border-t-amber-500', data: play.offer_ladder.medium_risk_10, msg: play.message_variants.medium },
    { key: 'high_risk', label: 'High Risk', dot: 'bg-red-500', borderTop: 'border-t-red-500', data: play.offer_ladder.high_risk_15, msg: play.message_variants.high_risk },
  ];

  return (
    <div className="min-h-full pb-24">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-zinc-800">
        <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-3 inline-flex items-center gap-1">
          ← Back to Kitchen
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-xl font-semibold text-zinc-50">{play.play_name}</h1>
          <StatusBadge status="ready" />
        </div>
        <p className="text-sm text-zinc-500 mt-1">{play.audience.segment_name}</p>
      </div>

      <div className="px-8 py-6 space-y-8">

        {/* Section: Segment Rules */}
        <section>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Segment Rules</h2>
          <div className="bg-[#18181b] border border-zinc-800 rounded-md overflow-hidden mb-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-2.5 text-xs text-zinc-500 font-medium">Rule</th>
                  <th className="text-left px-4 py-2.5 text-xs text-zinc-500 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {play.audience.rules.map((rule, i) => {
                  const [field, ...rest] = rule.split(/\s+/);
                  const op = rest[0];
                  const val = rest.slice(1).join(' ');
                  return (
                    <tr key={i} className="border-b border-zinc-800/50 last:border-0">
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">{field} {op}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-orange-400">{val}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="text-sm text-zinc-400">
            <span className="text-zinc-50 font-medium">{play.audience.matched_count}</span> matched →{' '}
            <span className="text-zinc-50 font-medium">{play.audience.frequency_cap_excluded}</span> excluded by freq cap →{' '}
            <span className="text-orange-500 font-medium">{play.audience.eligible_count}</span> eligible
          </div>
        </section>

        {/* Section: Offer Ladder + Messages */}
        <section>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Offer Ladder & Messages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiers.map((tier) => (
              <div key={tier.key} className={`bg-[#18181b] border border-zinc-800 border-t-2 ${tier.borderTop} rounded-md p-4 space-y-3`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${tier.dot}`} />
                  <span className="text-sm font-semibold text-zinc-50">{tier.label}</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-zinc-50">{tier.data.count}</div>
                  <div className="text-xs text-zinc-500">customers</div>
                </div>
                <div className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded font-medium inline-block">
                  {tier.data.label}
                </div>

                {/* Message bubble */}
                <div className="bg-zinc-800 rounded-lg p-3 text-xs text-zinc-300 leading-relaxed">
                  {fillTemplate(tier.msg, PLACEHOLDER_NAMES[tier.key])}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Predicted Results */}
        <section>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Predicted Results</h2>
          <MetricsGrid predicted={play.predicted} />
        </section>

      </div>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-[220px] right-0 border-t border-zinc-800 bg-[#111111] px-8 py-4 flex items-center justify-between">
        <div className="text-sm text-zinc-400">
          Ready to send to <span className="text-zinc-50 font-semibold">{play.audience.eligible_count}</span> eligible customers
        </div>
        <button
          onClick={handleLaunch}
          disabled={launching}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-8 rounded-md transition-colors duration-150 text-sm flex items-center gap-2"
        >
          {launching ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Launching…
            </>
          ) : (
            'Launch Play'
          )}
        </button>
      </div>
    </div>
  );
}
