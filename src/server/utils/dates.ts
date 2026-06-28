import 'server-only';

/** UTC date-only key 'YYYY-MM-DD' (stable across timezones). */
export function toNightKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Enumerates the nights of a stay: from check-in (inclusive) to check-out
 * (exclusive). A stay of 2026-07-01 → 2026-07-03 occupies nights 07-01, 07-02.
 */
export function eachNight(checkIn: Date, checkOut: Date): string[] {
  const nights: string[] = [];
  const cursor = new Date(
    Date.UTC(checkIn.getUTCFullYear(), checkIn.getUTCMonth(), checkIn.getUTCDate()),
  );
  const end = new Date(
    Date.UTC(checkOut.getUTCFullYear(), checkOut.getUTCMonth(), checkOut.getUTCDate()),
  );
  while (cursor < end) {
    nights.push(toNightKey(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return nights;
}

/** Number of nights in a stay. */
export function nightsBetween(checkIn: Date, checkOut: Date): number {
  return eachNight(checkIn, checkOut).length;
}

/** Day-of-week (0=Sun…6=Sat) for a 'YYYY-MM-DD' night key, in UTC. */
export function nightDow(nightKey: string): number {
  return new Date(`${nightKey}T00:00:00.000Z`).getUTCDay();
}
