import * as data from '@/api/data/wdw';
import { Resort } from '@/api/resort';
import { ClientsProvider, createClients } from '@/contexts/Clients';
import { ResortProvider } from '@/contexts/Resort';
import { render } from '@/testing';

const hm = '80010208';
const sm = '80010190';

for (const exp of Object.values(data.experiences)) delete exp?.dropTimes;
data.experiences[hm]!.dropTimes = ['13:30', '15:30'];
data.experiences[sm]!.dropTimes = ['11:30', '13:30'];

export const wdw = jest.mocked(new Resort('WDW', data));
const clients = jest.mocked(createClients(wdw));

export function renderResort(children: React.ReactNode) {
  return render(
    <ResortProvider value={wdw}>
      <ClientsProvider value={clients}>{children}</ClientsProvider>
    </ResortProvider>
  );
}

const { das, itinerary, liveData, ll, vq } = clients;
export { das, itinerary, liveData, ll, vq };
export const [mk, ep, hs, ak] = wdw.parks;
