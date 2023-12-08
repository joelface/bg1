import { dateTimeStrings } from './datetime';
import { fetchJson } from './fetch';

const PING_URL = 'https://bg1.joelface.com/ping';
const PING_KEY = 'bg1.ping';

type ServiceCode = 'D' | 'G' | 'V';
type LastPingDates = { [K in ServiceCode]?: string };

export async function ping(service: ServiceCode): Promise<void> {
  const { date } = dateTimeStrings();
  let pings: LastPingDates = {};
  try {
    pings = JSON.parse(localStorage.getItem(PING_KEY) || '{}');
  } catch (e) {
    // pass through
  }
  if (pings[service] === date) return;
  const { ok } = await fetchJson(PING_URL, {
    method: 'POST',
    data: { service },
  });
  pings[service] = date;
  if (ok) localStorage.setItem(PING_KEY, JSON.stringify(pings));
}
