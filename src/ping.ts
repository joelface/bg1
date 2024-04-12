import { Resort } from '@/api/data';
import { dateTimeStrings } from '@/datetime';
import kvdb from '@/kvdb';

const PING_URL = 'https://bg1.joelface.com/ping';

type ServiceCode = 'D' | 'G' | 'V';

export async function ping(
  resort: Resort,
  service: ServiceCode
): Promise<void> {
  const { date } = dateTimeStrings();
  const pingDateKey = ['bg1', 'ping', resort, service];
  const pingDate = kvdb.get<string>(pingDateKey);
  if (pingDate === date) return;
  const { ok } = await fetch(PING_URL, {
    method: 'POST',
    body: new URLSearchParams({ resort, service }),
  });
  if (ok) kvdb.set<string>(pingDateKey, date);
}
