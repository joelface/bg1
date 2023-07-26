import { avatarUrl } from '@/api/avatar';
import { DasBooking, Experience } from '@/api/das';
import { Experience as ExpData } from '@/api/data';
import * as data from '@/api/data/wdw';
import { TODAY } from '@/testing';

export const wdw = { resort: 'WDW' as const, ...data };

export const [mk] = [...data.parks.values()];

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

const { experiences: exp } = wdw;

export const hm: Experience = {
  ...(exp[80010208] as ExpData),
  type: 'ATTRACTION',
  available: true,
  nextAvailableTime: '10:30:00',
};
export const jc: Experience = {
  ...(exp[80010153] as ExpData),
  type: 'ATTRACTION',
  available: true,
  nextAvailableTime: '10:45:00',
};
export const sm: Experience = {
  ...(exp[80010190] as ExpData),
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
