import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/** The open lot closes 2h 14m 09s after the app starts (as in the design). */
const AUCTION_END = Date.now() + (2 * 3600 + 14 * 60 + 9) * 1000;

function format(left: number) {
  const h = Math.floor(left / 3600000);
  const m = Math.floor(left / 60000) % 60;
  const s = Math.floor(left / 1000) % 60;
  return (
    h +
    'h ' +
    String(m).padStart(2, '0') +
    'm ' +
    String(s).padStart(2, '0') +
    's'
  );
}

/** "2h 14m 09s" countdown that ticks every second while the screen is in front. */
export function useCountdown(): string {
  const [now, setNow] = useState(Date.now());
  useFocusEffect(
    useCallback(() => {
      setNow(Date.now());
      const iv = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(iv);
    }, []),
  );
  return format(Math.max(0, AUCTION_END - now));
}
