'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, CampaignAnalytics } from '@/lib/api';
import { showToast } from '@/components/ui/toaster';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pct(n: number, d: number) {
  if (!d) return '0.0%';
  return `${((n / d) * 100).toFixed(1)}%`;
}

function inr(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

// ─── Big Metric Card ──────────────────────────────────────────────────────────

function BigMetric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-[#18181b] border border-zinc-800 rounded-md p-5">
      <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-3xl font-bold text-zinc-50">{value}</div>
      {sub && <div className="text-sm text-zinc-500 mt-1">{sub}</div>}
    </div>
  );
}

// ─── Channel bar chart row ────────────────────────────────────────────────────

function ChannelRow({ name, sent, delivered, clicked, clickRate, maxRate }: {
  name: string; sent: number; delivered: number; clicked: number; clickRate: number; maxRate: number;
}) {
  const barPct = maxRate > 0 ? (clickRate / maxRate) * 100 : 0;
  return (
    <tr className="border-b border-zinc-800/50 last:border-0">
      <td className="py-3 px-4 text-sm text-zinc-300 capitalize font-medium">{name}</td>
      <td className="py-3 px-4 text-sm text-zinc-400 text-right">{sent.toLocaleString('en-IN')}</td>
      <td className="py-3 px-4 text-sm text-zinc-400 text-right">{delivered?.toLocaleString('en-IN') ?? '—'}</td>
      <td className="py-3 px-4 text-sm text-zinc-400 text-right">{clicked.toLocaleString('en-IN')}</td>
      <td className="py-3 px-4 w-44">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${barPct}%` }}
            />
          </div>
          <span className="text-xs text-zinc-400 w-10 text-right">{clickRate.toFixed(1)}%</span>
        </div>
      </td>
    </tr>
  );
}

// ─── Offer tier card ──────────────────────────────────────────────────────────

function TierCard({ label, dot, data, maxConv }: {
  label: string; dot: string; data: { sent: number; clicked: number; orders: number }; maxConv: number;
}) {
  const conv = data.sent > 0 ? (data.orders / data.sent) * 100 : 0;
  const barPct = maxConv > 0 ? (conv / maxConv) * 100 : 0;
  return (
    <div className="bg-[#18181b] border border-zinc-800 rounded-md p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        <span className="text-sm font-semibold text-zinc-50">{label}</span>
      </div>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between"><span className="text-zinc-500">Sent</span><span className="text-zinc-300">{data.sent}</span></div>
        <div className="flex justify-between"><span className="text-zinc-500">Clicked</span><span className="text-zinc-300">{data.clicked}</span></div>
        <div className="flex justify-between"><span className="text-zinc-500">Orders</span><span className="text-zinc-300">{data.orders}</span></div>
        <div className="flex justify-between"><span className="text-zinc-500">Conversion</span><span className="text-orange-400 font-medium">{conv.toFixed(1)}%</span></div>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full">
        <div
          className="h-full bg-orange-500 rounded-full transition-all duration-500"
          style={{ width: `${barPct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PerformanceKitchenPage() {
  const params = useParams();
  const campaignId = params.campaign_id as string;
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCampaignAnalytics(campaignId)
      .then(setAnalytics)
      .catch((err) => showToast(`Failed to load analytics: ${err.message}`, 'error'))
      .finally(() => setLoading(false));
  }, [campaignId]);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8 text-zinc-400">
        Analytics not found for this campaign.
        <Link href="/campaigns" className="text-orange-500 hover:underline ml-2">View all campaigns</Link>
      </div>
    );
  }

  const channels = Object.entries(analytics.by_channel ?? {});
  const maxClickRate = Math.max(...channels.map(([, v]) => v.click_rate ?? 0), 1);

  const tiers = [
    { key: 'loyal', label: 'Loyal', dot: 'bg-emerald-500' },
    { key: 'medium', label: 'Medium Risk', dot: 'bg-amber-500' },
    { key: 'high', label: 'High Risk', dot: 'bg-red-500' },
  ];

  const maxConv = Math.max(
    ...tiers.map(({ key }) => {
      const d = analytics.by_offer_tier?.[key];
      return d && d.sent > 0 ? (d.orders / d.sent) * 100 : 0;
    }),
    1
  );

  const completedAt = analytics.completed_at
    ? new Date(analytics.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
          <span>Performance Kitchen</span>
          <span>/</span>
          <span className="text-zinc-400">{analytics.campaign_name}</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-zinc-50">{analytics.campaign_name}</h1>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${analytics.status === 'completed' ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
            {analytics.status}
          </span>
          {completedAt && <span className="text-xs text-zinc-500">Completed {completedAt}</span>}
        </div>
      </div>

      {/* Key Metrics */}
      <section>
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Key Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <BigMetric label="Sent" value={analytics.sent.toLocaleString('en-IN')} />
          <BigMetric label="Delivered" value={analytics.delivered.toLocaleString('en-IN')} sub={`${analytics.delivery_rate.toFixed(1)}% delivery rate`} />
          <BigMetric label="Failed" value={analytics.failed.toLocaleString('en-IN')} sub={pct(analytics.failed, analytics.sent)} />
          <BigMetric label="Read / Opened" value={analytics.read_or_opened.toLocaleString('en-IN')} sub={pct(analytics.read_or_opened, analytics.delivered)} />
          <BigMetric label="Clicked" value={analytics.clicked.toLocaleString('en-IN')} sub={`${analytics.click_rate.toFixed(1)}% click rate`} />
          <BigMetric label="Orders" value={analytics.attributed_orders.toLocaleString('en-IN')} sub={`${analytics.conversion_rate.toFixed(1)}% conversion`} />
          <div className="bg-[#18181b] border border-zinc-800 rounded-md p-5 md:col-span-2">
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Revenue</div>
            <div className="text-3xl font-bold text-orange-500">{inr(analytics.attributed_revenue)}</div>
          </div>
        </div>
      </section>

      {/* Channel Performance */}
      {channels.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Channel Performance</h2>
          <div className="bg-[#18181b] border border-zinc-800 rounded-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Channel</th>
                  <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium">Sent</th>
                  <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium">Delivered</th>
                  <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium">Clicked</th>
                  <th className="px-4 py-3 text-xs text-zinc-500 font-medium">Click Rate</th>
                </tr>
              </thead>
              <tbody>
                {channels.map(([name, data]) => (
                  <ChannelRow
                    key={name}
                    name={name}
                    sent={data.sent}
                    delivered={data.delivered ?? 0}
                    clicked={data.clicked}
                    clickRate={data.click_rate ?? 0}
                    maxRate={maxClickRate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Offer Ladder Performance */}
      {analytics.by_offer_tier && (
        <section>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Offer Ladder Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiers.map(({ key, label, dot }) => {
              const data = analytics.by_offer_tier?.[key];
              if (!data) return null;
              return (
                <TierCard key={key} label={label} dot={dot} data={data} maxConv={maxConv} />
              );
            })}
          </div>
        </section>
      )}

      {/* AI Insight */}
      {analytics.ai_insight && (
        <section>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">AI Insight</h2>
          <div className="bg-zinc-900 border border-orange-500/30 rounded-md p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-orange-400">
              <span>✦</span>
              <span>AI Insight</span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{analytics.ai_insight}</p>
            <div className="pt-1">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded transition-colors"
              >
                Suggested Next Play →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <div className="pt-4 border-t border-zinc-800">
        <Link
          href="/"
          className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-6 rounded-md transition-colors duration-150 text-sm"
        >
          Run Again →
        </Link>
      </div>
    </div>
  );
}
