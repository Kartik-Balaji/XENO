'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, Campaign } from '@/lib/api';
import { showToast } from '@/components/ui/toaster';
import { Skeleton } from '@/components/ui/skeleton';

function StatusBadgeCell({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; text: string; dot?: boolean }> = {
    draft: { bg: 'bg-zinc-800', text: 'text-zinc-400' },
    scheduled: { bg: 'bg-blue-950', text: 'text-blue-400' },
    sending: { bg: 'bg-amber-950', text: 'text-amber-400', dot: true },
    completed: { bg: 'bg-emerald-950', text: 'text-emerald-400' },
  };
  const c = cfg[status] ?? { bg: 'bg-zinc-800', text: 'text-zinc-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded ${c.bg} ${c.text}`}>
      {c.dot && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
      {status}
    </span>
  );
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCampaigns()
      .then(setCampaigns)
      .catch((err) => showToast(`Failed to load campaigns: ${err.message}`, 'error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50">Campaigns</h1>
          <p className="text-sm text-zinc-500 mt-1">All marketing campaigns and their performance</p>
        </div>
        <Link
          href="/"
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          + New Campaign
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-[#18181b] border border-zinc-800 rounded-md p-12 text-center">
          <div className="text-zinc-400 text-sm">No campaigns yet.</div>
          <Link href="/" className="mt-3 inline-block text-orange-500 hover:underline text-sm">
            Create your first play in Growth Kitchen →
          </Link>
        </div>
      ) : (
        <div className="bg-[#18181b] border border-zinc-800 rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium">Name</th>
                <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium">Status</th>
                <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium">Launched</th>
                <th className="text-right px-5 py-3 text-xs text-zinc-500 font-medium">Messages</th>
                <th className="text-right px-5 py-3 text-xs text-zinc-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.campaign_id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-zinc-200">
                      {c.campaign_name ?? c.campaign_id}
                    </div>
                    <div className="text-xs text-zinc-600 font-mono mt-0.5">{c.campaign_id}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadgeCell status={c.status} />
                  </td>
                  <td className="px-5 py-3.5 text-zinc-500">
                    {c.launched_at
                      ? new Date(c.launched_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right text-zinc-400">
                    {c.created_messages?.toLocaleString('en-IN') ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {(c.status === 'sending' || c.status === 'scheduled') && (
                        <Link
                          href={`/monitor/${c.campaign_id}`}
                          className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded transition-colors"
                        >
                          Monitor →
                        </Link>
                      )}
                      {c.status === 'completed' && (
                        <Link
                          href={`/analytics/${c.campaign_id}`}
                          className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded transition-colors"
                        >
                          Analytics →
                        </Link>
                      )}
                      <Link
                        href={`/monitor/${c.campaign_id}`}
                        className="text-xs text-zinc-600 hover:text-zinc-400 px-2 py-1 transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
