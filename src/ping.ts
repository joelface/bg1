import { Resort } from './api/data';
import { dateTimeStrings } from './datetime';

const PING_URL = 'https://bg1.joelface.com/ping';
const PING_KEY = 'bg1.ping';

type ServiceCode = 'D' | 'G' | 'V';
type LastPingDates = { [K in ServiceCode]?: string };

export async function ping(
  resort: Resort,
  service: ServiceCode
): Promise<void> {
  const { date } = dateTimeStrings();
  let pings: LastPingDates = {};
  try {
    pings = JSON.parse(localStorage.getItem(PING_KEY) || '{}');
  } catch {
    // pass through
  }
  if (pings[service] === date) return;
  const { ok } = await fetch(PING_URL, {
    method: 'POST',
    body: new URLSearchParams({ resort, service }),
  });
  if (ok) {
    pings[service] = date;
    localStorage.setItem(PING_KEY, JSON.stringify(pings));
  }
}
