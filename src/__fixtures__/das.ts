import { avatarUrl } from '@/api/avatar';
import { DasBooking, Experience } from '@/api/das';
import { TODAY } from '@/testing';

import { mk, wdw } from './resort';

export * from './resort';

export const mickey = {
  id: 'mickey',
  name: 'Mickey Mouse',
  avatarImageUrl: avatarUrl('17532228'),
};

export const minnie = {
  id: 'minnie',
  name: 'Minnie Mouse',
  avatarImageUrl: avatarUrl('90004486'),
};

export const party = {
  primaryGuest: mickey,
  linkedGuests: [minnie],
  selectionLimit: 4,
};

export const hm: Experience = {
  ...wdw.experience('80010208'),
  type: 'ATTRACTION',
  available: true,
  time: '10:30:00',
};
export const jc: Experience = {
  ...wdw.experience('80010153'),
  type: 'ATTRACTION',
  available: true,
  time: '10:45:00',
};
export const sm: Experience = {
  ...wdw.experience('80010190'),
  type: 'ATTRACTION',
  available: true,
  time: '10:40:00',
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
