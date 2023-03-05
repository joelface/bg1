import data from '@/api/data/wdw';
import {
  Booking,
  ExpData,
  Experience,
  GenieClient,
  LightningLane,
  Offer,
  PlusExperience,
  Reservation,
} from '@/api/genie';

const TODAY = '2021-10-01';

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
  ...(data.experiences['80010208'] as ExpData),
  id: '80010208',
  park: mk,
  type: 'ATTRACTION',
  standby: { available: true, waitTime: 30 },
  flex: { available: true, nextAvailableTime: '11:15:00' },
  priority: 2.3,
  sort: 1,
};

export const jc: PlusExperience = {
  ...(data.experiences['80010153'] as ExpData),
  id: '80010153',
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
  ...(data.experiences['80010190'] as ExpData),
  id: '80010190',
  park: mk,
  type: 'ATTRACTION',
  standby: { available: true, waitTime: 60 },
  flex: { available: true, nextAvailableTime: '10:40:00' },
  priority: 2.0,
  sort: 1,
  drop: true,
};

export const sdd: PlusExperience = {
  ...(data.experiences['18904138'] as ExpData),
  id: '18904138',
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
  subtype: 'MULTI',
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

const dropExps = [sm, hm].map(({ id, name }) => ({ id, name }));

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
jest.spyOn(client, 'upcomingDrops').mockReturnValue([
  { time: '11:30', experiences: dropExps },
  { time: '13:30', experiences: dropExps },
]);
jest.spyOn(client, 'setPartyIds');
