'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { api, CampaignEvent, Campaign } from '@/lib/api';
import { showToast } from '@/components/ui/toaster';
import { clsx } from 'clsx';

// ─── Event styling config ────────────────────────────────────────────────────

const EVENT_CONFIG: Record<string, { label: string; className: string }> = {
  sent: { label: 'sent', className: 'bg-zinc-700 text-zinc-300' },
  delivered: { label: 'delivered', className: 'bg-blue-950 text-blue-400' },
  read: { label: 'read', className: 'bg-indigo-950 text-indigo-400' },
  clicked: { label: 'clicked', className: 'bg-purple-950 text-purple-400' },
  order_created: { label: '✓ order', className: 'bg-emerald-950 text-emerald-400' },
  failed: { label: 'failed', className: 'bg-red-950 text-red-400' },
  retry_scheduled: { label: 'retry', className: 'bg-amber-950 text-amber-400' },
  sent_after_retry: { label: 'retried', className: 'bg-teal-950 text-teal-400' },
  duplicate_callback_ignored: { label: 'DUPE', className: 'bg-yellow-950 text-yellow-400' },
  skipped: { label: 'skipped', className: 'bg-zinc-800 text-zinc-500' },
};

const CHANNEL_CONFIG: Record<string, { label: string; className: string }> = {
  whatsapp: { label: 'WA', className: 'bg-green-950 text-green-400' },
  sms: { label: 'SMS', className: 'bg-purple-950 text-purple-400' },
  email: { label: 'Email', className: 'bg-blue-950 text-blue-400' },
  rcs: { label: 'RCS', className: 'bg-amber-950 text-amber-400' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
  } catch {
    return '??:??:??';
  }
}

function getInitials(customerId: string) {
  const clean = customerId.replace(/[^a-zA-Z]/g, '');
  return clean.slice(0, 2).toUpperCase() || 'CS';
}

// ─── Aggregate counters ───────────────────────────────────────────────────────

interface Counters {
  sent: number;
  delivered: number;
  read: number;
  clicked: number;
  orders: number;
  failed: number;
  byChannel: Record<string, { sent: number; clicked: number }>;
}

function buildCounters(events: CampaignEvent[]): Counters {
  const c: Counters = { sent: 0, delivered: 0, read: 0, clicked: 0, orders: 0, failed: 0, byChannel: {} };
  for (const ev of events) {
    if (ev.duplicate) continue;
    const ch = ev.channel?.toLowerCase() ?? 'unknown';
    if (!c.byChannel[ch]) c.byChannel[ch] = { sent: 0, clicked: 0 };
    switch (ev.event_type) {
      case 'sent': c.sent++; c.byChannel[ch].sent++; break;
      case 'delivered': c.delivered++; break;
      case 'read': c.read++; break;
      case 'clicked': c.clicked++; c.byChannel[ch].clicked++; break;
      case 'order_created': c.orders++; break;
      case 'failed': c.failed++; break;
    }
  }
  return c;
}

// ─── EventRow component ───────────────────────────────────────────────────────

function EventRow({ event }: { event: CampaignEvent }) {
  const evCfg = EVENT_CONFIG[event.event_type] ?? { label: event.event_type, className: 'bg-zinc-800 text-zinc-400' };
  const chCfg = CHANNEL_CONFIG[event.channel?.toLowerCase()] ?? { label: event.channel, className: 'bg-zinc-800 text-zinc-400' };
  const isDuplicate = event.duplicate === 1 || event.duplicate === true;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex items-center gap-3 py-2 px-3 border-b border-zinc-800/60 hover:bg-zinc-900/50 transition-colors"
    >
      {/* Time */}
      <span className="text-xs text-zinc-600 font-mono w-20 shrink-0">
        {formatTime(event.event_time || event.received_at)}
      </span>

      {/* Message ID */}
      <span className="text-xs text-zinc-600 font-mono w-20 shrink-0 truncate">
        {event.message_id?.slice(0, 8) ?? '—'}
      </span>

      {/* Channel badge */}
      <span className={`text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${chCfg.className}`}>
        {chCfg.label}
      </span>

      {/* Event badge */}
      {event.event_type === 'skipped' ? (
        <span className="text-xs text-zinc-600 italic">skipped</span>
      ) : (
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${evCfg.className}`}>
          {evCfg.label}
        </span>
      )}

      {/* Duplicate label */}
      {isDuplicate && (
        <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-yellow-950 text-yellow-400">DUPE</span>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Customer initials avatar */}
      <div className="w-7 h-7 rounded bg-zinc-700 text-zinc-300 text-xs flex items-center justify-center font-medium shrink-0">
        {getInitials(event.customer_id ?? '')}
      </div>
    </motion.div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-500">{label}</span>
        <span className="text-zinc-300 font-medium">{value.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SendMonitorPage() {
  const params = useParams();
  const campaignId = params.campaign_id as string;

  const [events, setEvents] = useState<CampaignEvent[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [sseConnected, setSseConnected] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seenIds = useRef(new Set<string>());

  // Load campaign info
  useEffect(() => {
    api.getCampaign(campaignId)
      .then(setCampaign)
      .catch(() => {}); // non-fatal
  }, [campaignId]);

  // Load initial events
  useEffect(() => {
    api.getCampaignEvents(campaignId)
      .then((evts) => {
        const sorted = [...evts].sort(
          (a, b) => new Date(b.event_time || b.received_at).getTime() - new Date(a.event_time || a.received_at).getTime()
        );
        sorted.forEach(e => seenIds.current.add(e.event_id));
        setEvents(sorted);
      })
      .catch(() => {});
  }, [campaignId]);

  // SSE with polling fallback
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    let es: EventSource;

    function addEvent(evt: CampaignEvent) {
      if (seenIds.current.has(evt.event_id)) return;
      seenIds.current.add(evt.event_id);
      setEvents((prev) => [evt, ...prev]);
    }

    try {
      es = new EventSource(`${API_URL}/api/campaigns/${campaignId}/events`);
      es.onopen = () => setSseConnected(true);
      es.onmessage = (e) => {
        try {
          const evt = JSON.parse(e.data) as CampaignEvent;
          addEvent(evt);
        } catch {}
      };
      es.onerror = () => {
        setSseConnected(false);
        es.close();
        // Fallback: poll every 2s
        pollRef.current = setInterval(async () => {
          try {
            const evts = await api.getCampaignEvents(campaignId);
            evts.forEach(addEvent);
          } catch {}
        }, 2000);
      };
    } catch {
      // EventSource not supported — use polling
      pollRef.current = setInterval(async () => {
        try {
          const evts = await api.getCampaignEvents(campaignId);
          evts.forEach(addEvent);
        } catch {}
      }, 2000);
    }

    return () => {
      es?.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [campaignId]);

  const counters = buildCounters(events);
  const deliveryRate = counters.sent > 0 ? (counters.delivered / counters.sent) * 100 : 0;
  const clickRate = counters.delivered > 0 ? (counters.clicked / counters.delivered) * 100 : 0;
  const convRate = counters.clicked > 0 ? (counters.orders / counters.clicked) * 100 : 0;

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-zinc-50">Send Monitor</h1>
          {campaign && (
            <span className="text-sm text-zinc-500">{campaign.campaign_name ?? campaignId}</span>
          )}
          {sseConnected && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          )}
        </div>
        <Link
          href={`/analytics/${campaignId}`}
          className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded transition-colors"
        >
          View Analytics →
        </Link>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Event stream */}
        <div className="flex-[3] border-r border-zinc-800 overflow-y-auto flex flex-col">
          <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-2 shrink-0">
            <span className="text-xs text-zinc-500 font-medium">EVENT STREAM</span>
            <span className="text-xs text-zinc-600">({events.length} events)</span>
          </div>
          <div className="flex-1">
            <AnimatePresence initial={false}>
              {events.map((ev) => (
                <EventRow key={ev.event_id} event={ev} />
              ))}
            </AnimatePresence>
            {events.length === 0 && (
              <div className="px-6 py-12 text-center text-zinc-600 text-sm">
                Waiting for events…
              </div>
            )}
          </div>
        </div>

        {/* Right: Live stats */}
        <div className="flex-[2] overflow-y-auto p-5 space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-50">Live Stats</span>
            {campaign?.status === 'sending' && (
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            )}
          </div>

          {/* Counter grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Sent', value: counters.sent, color: 'text-zinc-50' },
              { label: 'Delivered', value: counters.delivered, color: 'text-blue-400' },
              { label: 'Read', value: counters.read, color: 'text-indigo-400' },
              { label: 'Clicked', value: counters.clicked, color: 'text-purple-400' },
              { label: 'Orders', value: counters.orders, color: 'text-emerald-400' },
              { label: 'Failed', value: counters.failed, color: 'text-red-400' },
            ].map((item) => (
              <div key={item.label} className="bg-[#18181b] border border-zinc-800 rounded-md p-3">
                <div className="text-xs text-zinc-500">{item.label}</div>
                <div className={`text-2xl font-bold ${item.color}`}>
                  {item.value.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          {/* Progress bars */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-md p-4 space-y-3">
            <div className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Rates</div>
            <ProgressBar label="Delivery Rate" value={deliveryRate} color="bg-blue-500" />
            <ProgressBar label="Click Rate" value={clickRate} color="bg-purple-500" />
            <ProgressBar label="Conversion Rate" value={convRate} color="bg-emerald-500" />
          </div>

          {/* By Channel */}
          {Object.keys(counters.byChannel).length > 0 && (
            <div className="bg-[#18181b] border border-zinc-800 rounded-md p-4">
              <div className="text-xs text-zinc-500 font-medium uppercase tracking-wide mb-3">By Channel</div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-1.5 text-zinc-500 font-medium">Channel</th>
                    <th className="text-right py-1.5 text-zinc-500 font-medium">Sent</th>
                    <th className="text-right py-1.5 text-zinc-500 font-medium">Clicked</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(counters.byChannel).map(([ch, data]) => (
                    <tr key={ch} className="border-b border-zinc-800/40 last:border-0">
                      <td className="py-1.5 text-zinc-300 capitalize">{ch}</td>
                      <td className="py-1.5 text-right text-zinc-400">{data.sent}</td>
                      <td className="py-1.5 text-right text-zinc-400">{data.clicked}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
