import { avatarUrl } from '@/api/avatar';
import { DasBooking, Experience } from '@/api/das';
import * as data from '@/api/data/wdw';
import { Experience as ExpData, Resort } from '@/api/resort';
import { TODAY } from '@/testing';

export const wdw = new Resort('WDW', data);

export const [mk] = [...wdw.parks.values()];

export const mickey = {
  id: 'mickey',
  name: 'Mickey Mouse',
  avatarImageUrl: avatarUrl('17532228'),
  primary: true,
};

export const minnie = {
  id: 'minnie',
  name: 'Minnie Mouse',
  avatarImageUrl: avatarUrl('90004486'),
};

export const party = [mickey, minnie];

export const hm: Experience = {
  ...(wdw.experience('80010208') as ExpData),
  type: 'ATTRACTION',
  available: true,
  nextAvailableTime: '10:30:00',
};
export const jc: Experience = {
  ...(wdw.experience('80010153') as ExpData),
  type: 'ATTRACTION',
  available: true,
  nextAvailableTime: '10:45:00',
};
export const sm: Experience = {
  ...(wdw.experience('80010190') as ExpData),
  type: 'ATTRACTION',
  available: true,
  nextAvailableTime: '10:40:00',
};

export const booking: DasBooking = {
  type: 'DAS',
  subtype: 'IN_PARK',
  id: hm.id,
  name: hm.name,
  park: mk,
  guests: [
    { ...mickey, entitlementId: 'ent1' },
    { ...minnie, entitlementId: 'ent2' },
  ],
  start: { date: TODAY, time: '10:30:00' },
  end: {},
  bookingId: 'hm1030',
};
