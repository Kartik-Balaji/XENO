'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, Campaign } from '@/lib/api';
import { TopBar } from '@/components/TopBar';
import { showToast } from '@/components/ui/toaster';

const STATUS_ORDER = ['sending', 'scheduled', 'draft', 'completed'];

function StatusDot({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; text: string; dot?: boolean }> = {
    sending: { bg: 'bg-[#FEF3DC]', text: 'text-[#A0660A]', dot: true },
    scheduled: { bg: 'bg-blue-50', text: 'text-blue-700' },
    draft: { bg: 'bg-[#F5F0E8]', text: 'text-[#6B5D52]' },
    completed: { bg: 'bg-[#E6F4EC]', text: 'text-[#2E7D52]' },
  };
  const c = cfg[status] ?? cfg.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${c.bg} ${c.text}`}>
      {c.dot && <span className="w-1.5 h-1.5 rounded-full bg-[#A0660A] animate-pulse" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function MonitorIndexPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCampaigns()
      .then(list => {
        const sorted = [...list].sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
        setCampaigns(sorted);
      })
      .catch(e => showToast(`Failed to load campaigns: ${e.message}`, 'error'))
      .finally(() => setLoading(false));
  }, []);

  const active = campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled');
  const others = campaigns.filter(c => c.status !== 'sending' && c.status !== 'scheduled');

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <TopBar title="Send Monitor" subtitle="Select a campaign to watch its live event stream" />
      <main className="p-8 max-w-4xl mx-auto">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-white border border-[#E8E0D0] rounded-xl h-16 animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-8">
            {active.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[16px] text-[#A0660A]">vital_signs</span>
                  <h2 className="text-sm font-semibold text-[#1A1410] uppercase tracking-widest">Live Now</h2>
                  <span className="ml-1 w-2 h-2 rounded-full bg-[#A0660A] animate-pulse" />
                </div>
                <div className="space-y-2">
                  {active.map(c => (
                    <Link key={c.campaign_id} href={`/monitor/${c.campaign_id}`} className="flex items-center justify-between bg-white border border-[#E8E0D0] rounded-xl px-5 py-4 hover:border-[#D95F2B] hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-lg bg-[#FEF3DC] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[18px] text-[#A0660A]" style={{ fontVariationSettings: "'FILL' 1" }}>vital_signs</span>
                        </div>
                        <div>
                          <p className="font-medium text-[#1A1410]">{c.campaign_name ?? c.campaign_id}</p>
                          <p className="text-xs text-[#A89880] font-mono mt-0.5">{c.campaign_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusDot status={c.status} />
                        <span className="material-symbols-outlined text-[18px] text-[#A89880] group-hover:text-[#D95F2B] transition-colors">arrow_forward</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[16px] text-[#6B5D52]">history</span>
                <h2 className="text-sm font-semibold text-[#1A1410] uppercase tracking-widest">All Campaigns</h2>
              </div>
              {others.length === 0 && active.length === 0 ? (
                <div className="bg-white border border-[#E8E0D0] rounded-xl p-12 text-center">
                  <span className="material-symbols-outlined text-[40px] text-[#D4C9B8]">vital_signs</span>
                  <p className="text-sm text-[#6B5D52] mt-3">No campaigns yet.</p>
                  <Link href="/kitchen" className="mt-2 inline-block text-[#D95F2B] hover:underline text-sm font-medium">Create your first play →</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {others.map(c => (
                    <Link key={c.campaign_id} href={`/monitor/${c.campaign_id}`} className="flex items-center justify-between bg-white border border-[#E8E0D0] rounded-xl px-5 py-4 hover:border-[#D95F2B] hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-lg bg-[#F5F0E8] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[18px] text-[#6B5D52]">send</span>
                        </div>
                        <div>
                          <p className="font-medium text-[#1A1410]">{c.campaign_name ?? c.campaign_id}</p>
                          <p className="text-xs text-[#A89880] font-mono mt-0.5">{c.campaign_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusDot status={c.status} />
                        <span className="material-symbols-outlined text-[18px] text-[#A89880] group-hover:text-[#D95F2B] transition-colors">arrow_forward</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
