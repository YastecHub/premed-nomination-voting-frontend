import { useState, useEffect } from "react";

/**
 * Live countdown to a target date.
 * Returns { days, hours, minutes, seconds, expired }
 */
export function useCountdown(targetDate) {
  const calc = () => {
    if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    const diff = new Date(targetDate) - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { days, hours, minutes, seconds, expired: false };
  };

  const [time, setTime] = useState(calc);

  useEffect(() => {
    if (!targetDate) return;
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return time;
}
