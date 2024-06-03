import { Resort } from '@/api/resort';
import { dateTimeStrings } from '@/datetime';
import kvdb from '@/kvdb';

const PING_URL = 'https://bg1.joelface.com/ping';

type ServiceCode = 'D' | 'G' | 'V';

export async function ping(
  resort: Pick<Resort, 'id'>,
  service: ServiceCode
): Promise<void> {
  const { date } = dateTimeStrings();
  const pingDateKey = ['bg1', 'ping', resort.id, service];
  const pingDate = kvdb.get<string>(pingDateKey);
  if (pingDate === date) return;
  const { ok } = await fetch(PING_URL, {
    method: 'POST',
    body: new URLSearchParams({ resort: resort.id, service }),
  });
  if (ok) kvdb.set<string>(pingDateKey, date);
}
