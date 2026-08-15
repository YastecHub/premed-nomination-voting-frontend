import { useCountdown } from '../../hooks/useCountdown';
import { Clock } from 'lucide-react';

interface PhaseCountdownProps {
  targetDate: string | null | undefined;
  label?: string;
}

export default function PhaseCountdown({ targetDate, label = 'Closes in' }: PhaseCountdownProps) {
  const { days, hours, minutes, seconds, expired } = useCountdown(targetDate);

  if (!targetDate || expired) return null;

  return (
    <div className="flex items-center gap-3 text-xs">
      <Clock size={14} className="text-slate-500 flex-shrink-0" />
      <span className="text-slate-500">{label}</span>
      <div className="flex items-center gap-1.5 font-mono font-semibold">
        {days > 0 && <span className="text-indigo-400">{days}d</span>}
        <span className="text-indigo-400">{String(hours).padStart(2, '0')}h</span>
        <span className="text-slate-400">:</span>
        <span className="text-indigo-400">{String(minutes).padStart(2, '0')}m</span>
        <span className="text-slate-400">:</span>
        <span className="text-indigo-400">{String(seconds).padStart(2, '0')}s</span>
      </div>
    </div>
  );
}
