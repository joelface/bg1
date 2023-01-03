import {
  Booking,
  GenieClient,
  LightningLane,
  Offer,
  PlusExperience,
  Reservation,
} from '@/api/genie';
import data from '@/api/data/wdw';
import { Experience } from '@/hooks/useExperiences';
import { TODAY } from '@/testing';

data.pdts[80007944] = ['11:30', '14:30', '17:30'];

export const [mk, ep, hs, ak] = data.parks;

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
  id: '80010208',
  name: 'Haunted Mansion',
  park: mk,
  land: {
    name: 'Liberty Square',
    sort: 4,
    theme: { bg: 'bg-indigo-600', text: 'text-indigo-700' },
  },
  geo: [28.4208771, -81.5830102],
  type: 'ATTRACTION',
  standby: { available: true, waitTime: 30 },
  flex: { available: true, nextAvailableTime: '14:30:00' },
  priority: 2.3,
  sort: 1,
};

export const jc: PlusExperience = {
  id: '80010153',
  name: 'Jungle Cruise',
  park: mk,
  land: {
    name: 'Adventureland',
    sort: 1,
    theme: { bg: 'bg-green-600', text: 'text-green-700' },
  },
  geo: [28.4180339, -81.5834548],
  type: 'ATTRACTION',
  standby: { available: true, waitTime: 45 },
  flex: {
    available: true,
    nextAvailableTime: '18:00:00',
    preexistingPlan: true,
  },
  priority: 1.1,
  sort: 1,
};

export const sm: PlusExperience = {
  id: '80010192',
  name: 'Splash Mountain',
  park: mk,
  land: {
    name: 'Frontierland',
    sort: 3,
    theme: { bg: 'bg-yellow-600', text: 'text-yellow-700' },
  },
  geo: [28.4196223, -81.584991],
  type: 'ATTRACTION',
  standby: { available: true, waitTime: 60 },
  flex: { available: true, nextAvailableTime: '12:45:00' },
  priority: 2.0,
  sort: 2,
  drop: true,
};

export const sdd: PlusExperience = {
  id: 'sdd',
  name: 'Slinky Dog Dash',
  park: hs,
  land: {
    name: 'Toy Story Land',
    sort: 2,
    theme: { bg: 'bg-red-600', text: 'text-red-700' },
  },
  geo: [28.3562472, -81.5628474],
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
  subtype: 'MULTI',
  id: jc.id,
  name: jc.name,
  park: jc.park,
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
  start: { date: undefined, time: undefined },
  end: { date: undefined, time: undefined },
  cancellable: false,
  modifiable: false,
  guests: [{ ...pluto, entitlementId: 'sm_01', redemptions: 2 }],
  bookingId: 'sm_01',
};

export const lttRes: Reservation = {
  type: 'RES',
  subtype: 'DINING',
  id: '90006947',
  name: 'Liberty Tree Tavern Lunch',
  park: mk,
  start: { date: TODAY, time: '11:15:00' },
  end: undefined,
  cancellable: false,
  modifiable: false,
  guests: [mickey, minnie],
  bookingId: '38943;type=DINING',
};

export const bookings: Booking[] = [
  allDayExp,
  booking,
  lttRes,
  {
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
  },
  multiExp,
];

export const tracker = {
  experienced: (exp: Experience) => exp.id === bookings[3].id,
  update: async () => undefined,
};
export const client = new GenieClient({
  origin: 'https://disneyworld.disney.go.com',
  authStore: {
    getData: () => ({ swid: '', accessToken: '' }),
    setData: () => null,
    deleteData: () => null,
  },
  data,
  tracker,
}) as jest.Mocked<GenieClient>;
client.nextBookTime = '11:00:00';

jest.spyOn(client, 'guests').mockResolvedValue({
  eligible: [mickey, minnie, pluto],
  ineligible: [donald],
});
jest.spyOn(client, 'offer').mockResolvedValue(offer);
jest.spyOn(client, 'cancelOffer').mockResolvedValue(undefined);
jest.spyOn(client, 'book').mockResolvedValue({ ...booking });
jest.spyOn(client, 'cancelBooking').mockResolvedValue(undefined);
jest.spyOn(client, 'bookings').mockResolvedValue([...bookings]);
jest.spyOn(client, 'experiences').mockResolvedValue([hm, sm, jc]);
jest.spyOn(client, 'nextDropTime').mockReturnValue('11:30');
jest.spyOn(client, 'updateTracker').mockResolvedValue([]);
