import { createContext, useContext } from 'react';

import { DasClient } from '@/api/das';
import { ItineraryClient } from '@/api/itinerary';
import { LiveDataClient } from '@/api/livedata';
import { LLClient } from '@/api/ll';
import { LLClientDLR } from '@/api/ll/dlr';
import { LLClientWDW } from '@/api/ll/wdw';
import { Resort } from '@/api/resort';
import { VQClient } from '@/api/vq';

export interface Clients {
  das: DasClient;
  itinerary: ItineraryClient;
  liveData: LiveDataClient;
  ll: LLClient;
  vq: VQClient;
}

const ClientsContext = createContext<Clients>({
  das: {} as DasClient,
  itinerary: {} as ItineraryClient,
  liveData: {} as LiveDataClient,
  ll: {} as LLClient,
  vq: {} as VQClient,
});
export const ClientsProvider = ClientsContext.Provider;
export const useClients = () => useContext(ClientsContext);

export function createClients(resort: Resort) {
  const das = new DasClient(resort);
  const liveData = new LiveDataClient(resort);
  const vq = new VQClient(resort);
  const ll = new (resort.id === 'WDW' ? LLClientWDW : LLClientDLR)(resort);
  const itinerary = new ItineraryClient(resort);
  itinerary.onRefresh = bookings => ll.track(bookings);
  return { das, itinerary, liveData, ll, vq };
}
