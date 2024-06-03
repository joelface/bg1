import * as data from '@/api/data/wdw';
import {
  BoardingGroup,
  Booking,
  Experience,
  GenieClient,
  LightningLane,
  Offer,
  ParkPass,
  PlusExperience,
  Reservation,
} from '@/api/genie';
import { Experience as ExpData, Resort } from '@/api/resort';
import { TODAY, TOMORROW } from '@/testing';

const hmId = '80010208';
(data.experiences[hmId] as ExpData).dropTimes = ['11:30', '13:30'];
const smId = '80010190';
(data.experiences[smId] as ExpData).dropTimes = ['11:30', '13:30'];
export const wdw = new Resort('WDW', data);
export const [mk, ep, hs, ak] = [...wdw.parks.values()];

export const mickey = {
  id: 'mickey',
  name: 'Mickey Mouse',
  avatarImageUrl: undefined,
};
export const minnie = {
  id: 'minnie',
  name: 'Minnie Mouse',
  avatarImageUrl: undefined,
};
export const pluto = {
  id: 'pluto',
  name: 'Pluto',
  avatarImageUrl: undefined,
};
export const donald = {
  id: 'donald',
  name: 'Donald Duck',
  ineligibleReason: 'INVALID_PARK_ADMISSION' as const,
  avatarImageUrl: undefined,
};

export const hm: PlusExperience = {
  ...wdw.experience(hmId),
  park: mk,
  type: 'ATTRACTION',
  standby: { available: true, waitTime: 30 },
  flex: { available: true, nextAvailableTime: '11:15:00' },
  priority: 2.3,
  sort: 1,
};

export const jc: PlusExperience = {
  ...wdw.experience('80010153'),
  park: mk,
  type: 'ATTRACTION',
  standby: { available: true, waitTime: 45 },
  flex: {
    available: true,
    nextAvailableTime: '00:00:00',
    preexistingPlan: true,
  },
  priority: 1.1,
  sort: 1,
};

export const sm: PlusExperience = {
  ...wdw.experience(smId),
  park: mk,
  type: 'ATTRACTION',
  standby: { available: true, waitTime: 60 },
  flex: { available: true, nextAvailableTime: '10:40:00' },
  priority: 2.0,
  sort: 1,
};

export const sdd: PlusExperience = {
  ...wdw.experience('18904138'),
  park: hs,
  type: 'ATTRACTION',
  standby: { available: true, waitTime: 75 },
  flex: { available: false },
};

export const offer: Offer = {
  id: '123',
  start: { date: TODAY, time: '11:25:00' },
  end: { date: TODAY, time: '12:25:00' },
  active: true,
  changed: false,
  guests: {
    eligible: [mickey, minnie, pluto],
    ineligible: [],
  },
  experience: hm,
};

export const booking: LightningLane = {
  type: 'LL',
  subtype: 'G+',
  id: hm.id,
  name: hm.name,
  park: hm.park,
  start: { date: TODAY, time: '11:25:00' },
  end: { date: TODAY, time: '12:25:00' },
  cancellable: true,
  modifiable: true,
  guests: [
    { ...mickey, entitlementId: 'hm1125_01' },
    { ...minnie, entitlementId: 'hm1125_02' },
    { ...pluto, entitlementId: 'hm1125_03' },
  ],
  bookingId: 'hm1125_01',
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
  ],
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
  guests: [{ ...pluto, entitlementId: 'sm_01', redemptions: 2 }],
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
  guests: [mickey, minnie, pluto],
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
  guests: [mickey, minnie],
  bookingId: '38943;type=DINING',
};

export const akApr: ParkPass = {
  type: 'APR',
  id: ak.id,
  name: ak.name,
  park: ak,
  start: { date: TOMORROW, time: '06:00:00' },
  guests: [mickey, minnie, pluto],
  bookingId: 'ak20211002',
};

export const expiredLL: LightningLane = {
  type: 'LL',
  subtype: 'G+',
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
  ],
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

const authStore = {
  getData: () => ({ swid: '', accessToken: '' }),
  setData: () => null,
  deleteData: () => null,
  onUnauthorized: () => null,
};
export const tracker = {
  experienced: (exp: Experience) => exp.id === bookings[3].id,
  update: async () => undefined,
};
export const client = jest.mocked(new GenieClient(wdw, authStore, tracker));
client.nextBookTime = '11:00:00';

jest.spyOn(client, 'guests').mockResolvedValue({
  eligible: [mickey, minnie, pluto],
  ineligible: [donald],
});
jest.spyOn(client, 'offer').mockResolvedValue(offer);
jest.spyOn(client, 'book').mockResolvedValue({ ...booking });
jest.spyOn(client, 'cancelBooking').mockResolvedValue(undefined);
jest.spyOn(client, 'bookings').mockResolvedValue([...bookings]);
jest.spyOn(client, 'experiences').mockResolvedValue([hm, sm, jc]);
jest.spyOn(client, 'setPartyIds');
