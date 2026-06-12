import { clsx } from 'clsx';

type StatusType = 'draft' | 'scheduled' | 'sending' | 'completed' | 'ready' | string;

interface StatusBadgeProps {
  status: StatusType;
  pulse?: boolean;
}

const statusConfig: Record<string, { bg: string; text: string; dot?: string; label?: string }> = {
  draft: { bg: 'bg-zinc-800', text: 'text-zinc-400', label: 'Draft' },
  scheduled: { bg: 'bg-blue-950', text: 'text-blue-400', label: 'Scheduled' },
  sending: { bg: 'bg-amber-950', text: 'text-amber-400', dot: 'bg-amber-400', label: 'Sending' },
  completed: { bg: 'bg-emerald-950', text: 'text-emerald-400', label: 'Completed' },
  ready: { bg: 'bg-emerald-950', text: 'text-emerald-400', label: 'Ready to Launch' },
};

export function StatusBadge({ status, pulse }: StatusBadgeProps) {
  const cfg = statusConfig[status] ?? { bg: 'bg-zinc-800', text: 'text-zinc-400', label: status };
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded border',
        cfg.bg,
        cfg.text,
        status === 'ready' ? 'border-emerald-800' : 'border-transparent'
      )}
    >
      {cfg.dot && (
        <span
          className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot, pulse && 'animate-pulse')}
        />
      )}
      {cfg.label}
    </span>
  );
}
