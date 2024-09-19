import {
  BoardingGroup,
  Booking,
  LightningLane,
  ParkPass,
  Reservation,
} from '@/api/itinerary';
import { FlexExperience, HourlySlots, Offer } from '@/api/ll';
import { TODAY, TOMORROW } from '@/testing';

import { ak, hs, itinerary, ll, mk, wdw } from './resort';

export * from './resort';

export const mickey = {
  id: 'mickey',
  name: 'Mickey Mouse',
  primary: true,
  avatarImageUrl: undefined,
  orderDetails: {
    externalIdentifier: {
      id: 'mickey-id',
      idType: 'titus-guest-item-externalId',
    },
    orderId: 'mickey-orderId',
    orderItemId: 'mickey-orderItemId',
  },
};
export const minnie = {
  id: 'minnie',
  name: 'Minnie Mouse',
  primary: false,
  avatarImageUrl: undefined,
  orderDetails: {
    externalIdentifier: {
      id: 'minnie-externalId',
      idType: 'titus-guest-item-id',
    },
    orderId: 'minnie-orderId',
    orderItemId: 'minnie-orderItemId',
  },
};
export const pluto = {
  id: 'pluto',
  name: 'Pluto',
  primary: false,
  avatarImageUrl: undefined,
  orderDetails: {
    externalIdentifier: {
      id: 'pluto-externalId',
      idType: 'titus-guest-item-id',
    },
    orderId: 'pluto-orderId',
    orderItemId: 'pluto-orderItemId',
  },
};
export const donald = {
  id: 'donald',
  name: 'Donald Duck',
  primary: false,
  ineligibleReason: 'INVALID_PARK_ADMISSION' as const,
  avatarImageUrl: undefined,
  orderDetails: {
    externalIdentifier: {
      id: 'donald-externalId',
      idType: 'titus-guest-item-id',
    },
    orderId: 'donald-orderId',
    orderItemId: 'donald-orderItemId',
  },
};

export function omitOrderDetails<T extends { orderDetails?: unknown }>(
  guest: T
): Omit<T, 'orderDetails'> {
  return { ...guest, orderDetails: undefined };
}

export const hm: FlexExperience = {
  ...wdw.experience('80010208'),
  park: mk,
  type: 'ATTRACTION',
  standby: { available: true, waitTime: 30 },
  flex: { available: true, nextAvailableTime: '11:10:00' },
  priority: 2.3,
};
wdw.experience(hm.id).priority = hm.priority;

export const jc: FlexExperience = {
  ...wdw.experience('80010153'),
  park: mk,
  type: 'ATTRACTION',
  standby: { available: true, waitTime: 45 },
  flex: {
    available: true,
    nextAvailableTime: '00:00:00',
  },
  priority: 1.1,
};
wdw.experience(jc.id).priority = jc.priority;

export const sm: FlexExperience = {
  ...wdw.experience('80010190'),
  park: mk,
  type: 'ATTRACTION',
  standby: { available: true, waitTime: 60 },
  flex: { available: true, nextAvailableTime: '10:40:00' },
  priority: 2.0,
};
wdw.experience(sm.id).priority = sm.priority;

export const sdd: FlexExperience = {
  ...wdw.experience('18904138'),
  park: hs,
  type: 'ATTRACTION',
  standby: { available: true, waitTime: 75 },
  flex: { available: false },
};

export const booking: LightningLane = {
  type: 'LL',
  subtype: 'MP',
  id: hm.id,
  name: hm.name,
  park: hm.park,
  start: { date: TODAY, time: '11:00:00' },
  end: { date: TODAY, time: '12:00:00' },
  cancellable: true,
  modifiable: true,
  guests: [
    { ...mickey, entitlementId: 'hm_01' },
    { ...minnie, entitlementId: 'hm_02' },
    { ...pluto, entitlementId: 'hm_03' },
  ].map(omitOrderDetails),
  bookingId: 'hm_01',
};

export const multiExp: LightningLane = {
  type: 'LL',
  subtype: 'MEP',
  id: sdd.id,
  name: sdd.name,
  park: sdd.park,
  start: { date: TODAY, time: '15:15:00' },
  end: { date: TODAY, time: undefined },
  cancellable: false,
  modifiable: false,
  guests: [
    { ...mickey, entitlementId: 're1515_01', redemptions: 1 },
    { ...minnie, entitlementId: 're1515_02', redemptions: 1 },
    { ...pluto, entitlementId: 're1515_03', redemptions: 1 },
  ].map(omitOrderDetails),
  choices: [hm, jc, sdd, sm].map(({ id, name, park }) => ({ id, name, park })),
  bookingId: 're1515_01',
};

export const allDayExp: LightningLane = {
  type: 'LL',
  subtype: 'OTHER',
  id: sm.id,
  name: sm.name,
  park: sm.park,
  start: { date: TODAY, time: undefined },
  end: { date: undefined, time: undefined },
  cancellable: false,
  modifiable: false,
  guests: [{ ...pluto, entitlementId: 'sm_01', redemptions: 2 }].map(
    omitOrderDetails
  ),
  bookingId: 'sm_01',
};

const tron = wdw.experience('411504498');

export const bg: BoardingGroup = {
  type: 'BG',
  id: tron.id,
  name: tron.name,
  park: mk,
  boardingGroup: 42,
  status: 'IN_PROGRESS',
  guests: [mickey, minnie, pluto].map(omitOrderDetails),
  start: { date: TODAY, time: '07:00:00' },
  bookingId: 'tron_01',
};

export const lttRes: Reservation = {
  type: 'RES',
  subtype: 'DINING',
  id: '90006947',
  name: 'Liberty Tree Tavern Lunch',
  park: mk,
  start: { date: TODAY, time: '11:15:00' },
  end: undefined,
  guests: [mickey, minnie].map(omitOrderDetails),
  bookingId: '38943;type=DINING',
};

export const akApr: ParkPass = {
  type: 'APR',
  id: ak.id,
  name: ak.name,
  park: ak,
  start: { date: TOMORROW, time: '06:00:00' },
  guests: [mickey, minnie, pluto].map(omitOrderDetails),
  bookingId: 'ak20211002',
};

export const expiredLL: LightningLane = {
  type: 'LL',
  subtype: 'MP',
  id: jc.id,
  name: jc.name,
  park: jc.park,
  start: { date: TODAY, time: '14:00:00' },
  end: { date: TODAY, time: '15:00:00' },
  cancellable: true,
  modifiable: false,
  guests: [
    { ...mickey, entitlementId: 'jc1400_01' },
    { ...minnie, entitlementId: 'jc1400_02' },
  ].map(omitOrderDetails),
  bookingId: 'jc1400_01',
};

export const bookings: Booking[] = [
  bg,
  allDayExp,
  booking,
  lttRes,
  expiredLL,
  multiExp,
  akApr,
];

export const offer: Offer<undefined> = {
  id: '123',
  offerSetId: 'set123',
  start: { date: TODAY, time: '11:10:00' },
  end: { date: TODAY, time: '12:10:00' },
  active: true,
  changed: false,
  guests: {
    eligible: [mickey, minnie, pluto],
    ineligible: [],
  },
  experience: hm,
  booking: undefined,
};

export const modOffer: Offer<LightningLane> = { ...offer, booking };

export const times: HourlySlots = [
  [
    { startTime: '11:20:00', endTime: '12:20:00' },
    { startTime: '11:40:00', endTime: '12:40:00' },
    { startTime: '11:55:00', endTime: '12:55:00' },
  ],
  [
    { startTime: '12:05:00', endTime: '13:05:00' },
    { startTime: '12:25:00', endTime: '13:25:00' },
    { startTime: '12:45:00', endTime: '13:45:00' },
  ],
];

ll.nextBookTime = '11:00:00';

jest.spyOn(ll, 'guests').mockResolvedValue({
  eligible: [mickey, minnie, pluto],
  ineligible: [donald],
});
jest.spyOn(ll, 'offer').mockResolvedValue(offer);
jest.spyOn(ll, 'book').mockResolvedValue({ ...booking });
jest.spyOn(ll, 'cancelBooking').mockResolvedValue(undefined);
jest.spyOn(itinerary, 'plans').mockResolvedValue([...bookings]);
jest.spyOn(ll, 'experiences').mockResolvedValue([hm, sm, jc]);
jest.spyOn(ll, 'setPartyIds');
