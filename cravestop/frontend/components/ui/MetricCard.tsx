interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  wide?: boolean;
  accent?: boolean;
}

export function MetricCard({ label, value, sub, wide, accent }: MetricCardProps) {
  return (
    <div
      className={`bg-[#18181b] border border-zinc-800 rounded-md p-4 flex flex-col gap-1 ${wide ? 'col-span-2' : ''}`}
    >
      <div className="text-xs text-zinc-500 font-medium uppercase tracking-wide">{label}</div>
      <div className={`text-2xl font-bold ${accent ? 'text-orange-500' : 'text-zinc-50'}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-zinc-500">{sub}</div>}
    </div>
  );
}

interface MetricsGridProps {
  predicted: {
    messages_to_send: number;
    delivered: number;
    read_or_opened: number;
    clicked: number;
    orders: number;
    revenue: number;
  };
}

export function MetricsGrid({ predicted }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <MetricCard label="Messages" value={predicted.messages_to_send.toLocaleString('en-IN')} />
      <MetricCard label="Delivered" value={predicted.delivered.toLocaleString('en-IN')} />
      <MetricCard label="Read / Opened" value={predicted.read_or_opened.toLocaleString('en-IN')} />
      <MetricCard label="Clicked" value={predicted.clicked.toLocaleString('en-IN')} />
      <MetricCard label="Orders" value={predicted.orders.toLocaleString('en-IN')} />
      <MetricCard
        label="Revenue"
        value={`₹${predicted.revenue.toLocaleString('en-IN')}`}
        accent
      />
    </div>
  );
}
