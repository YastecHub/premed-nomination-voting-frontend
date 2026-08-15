import { useState, useEffect } from 'react';

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

const EXPIRED: CountdownResult = { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

function calc(targetDate: string | null | undefined): CountdownResult {
  if (!targetDate) return EXPIRED;
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return EXPIRED;
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
    expired: false,
  };
}

/**
 * Live countdown to a target ISO date string.
 * Returns { days, hours, minutes, seconds, expired }.
 */
export function useCountdown(targetDate: string | null | undefined): CountdownResult {
  const [time, setTime] = useState<CountdownResult>(() => calc(targetDate));

  useEffect(() => {
    if (!targetDate) return;
    const id = setInterval(() => setTime(calc(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return time;
}
