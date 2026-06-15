const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlayAudience {
  segment_name: string;
  matched_count: number;
  frequency_cap_excluded: number;
  eligible_count: number;
  rules: string[];
  computed_facts: {
    avg_rhythm_multiplier: number;
    pct_dinner_period: number;
    top_channel: string;
    top_meal_period: string;
    avg_churn_score: number;
  };
}

export interface OfferLadder {
  loyal_points: { count: number; offer_id: string; label: string };
  medium_risk_10: { count: number; offer_id: string; label: string };
  high_risk_15: { count: number; offer_id: string; label: string };
}

export interface MessageVariants {
  loyal: string;
  medium: string;
  high_risk: string;
}

export interface PredictedMetrics {
  messages_to_send: number;
  delivered: number;
  read_or_opened: number;
  clicked: number;
  orders: number;
  revenue: number;
}

export interface Play {
  play_id: string;
  play_name: string;
  objective: string;
  goal_text: string;
  audience: PlayAudience;
  reasoning: string;
  recommended_send_time: string;
  recommended_channels: string[];
  offer_ladder: OfferLadder;
  message_variants: MessageVariants;
  predicted: PredictedMetrics;
}

export interface Campaign {
  campaign_id: string;
  campaign_name?: string;
  play_id?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed';
  launched_at?: string;
  completed_at?: string;
  created_messages?: number;
  skipped_frequency_cap?: number;
  channel_service_batch_id?: string;
}

export interface CampaignEvent {
  event_id: string;
  event_type: string;
  channel: string;
  message_id: string;
  customer_id: string;
  event_time: string;
  received_at: string;
  duplicate?: number | boolean;
}

export interface ByChannelStats {
  sent: number;
  delivered?: number;
  clicked: number;
  delivery_rate?: number;
  click_rate?: number;
}

export interface ByOfferTierStats {
  sent: number;
  clicked: number;
  orders: number;
}

export interface CampaignAnalytics {
  campaign_id: string;
  campaign_name: string;
  status: string;
  sent: number;
  delivered: number;
  failed: number;
  read_or_opened: number;
  clicked: number;
  attributed_orders: number;
  attributed_revenue: number;
  delivery_rate: number;
  click_rate: number;
  conversion_rate: number;
  skipped_frequency_cap: number;
  by_channel: Record<string, ByChannelStats>;
  by_offer_tier: Record<string, ByOfferTierStats>;
  ai_insight: string;
  completed_at?: string;
}

// ─── API Helpers ──────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json();
}

export const api = {
  // Plays
  generatePlay: (goal: string) =>
    apiFetch<Play>('/api/plays/generate', {
      method: 'POST',
      body: JSON.stringify({ goal }),
    }),

  getPlay: (playId: string) =>
    apiFetch<Play>(`/api/plays/${playId}`),

  // Campaigns
  createCampaignFromPlay: (playId: string) =>
    apiFetch<Campaign>('/api/campaigns/from-play', {
      method: 'POST',
      body: JSON.stringify({ play_id: playId }),
    }),

  launchCampaign: (campaignId: string) =>
    apiFetch<Campaign>(`/api/campaigns/${campaignId}/launch`, {
      method: 'POST',
    }),

  getCampaigns: () =>
    apiFetch<{ campaigns: Campaign[] }>('/api/campaigns').then(res => res.campaigns || []),

  getCampaign: (campaignId: string) =>
    apiFetch<Campaign>(`/api/campaigns/${campaignId}`),

  getCampaignEvents: (campaignId: string) =>
    apiFetch<{ events: CampaignEvent[] } | any[]>(`/api/campaigns/${campaignId}/events`).then(res => {
      // Handle both { events: [...] } format and direct array format just in case
      if (Array.isArray(res)) return res;
      return res.events || [];
    }),

  getCampaignAnalytics: (campaignId: string) =>
    apiFetch<CampaignAnalytics>(`/api/campaigns/${campaignId}/analytics`),

  // SSE URL helper
  getCampaignEventsSSEUrl: (campaignId: string) =>
    `${API_URL}/api/campaigns/${campaignId}/events`,
};

export { API_URL };
