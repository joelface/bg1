import {
  Booking,
  BookingStack,
  GenieClient,
  Offer,
  PlusExperience,
} from '/api/genie';
import data from '/api/data/wdw';

data.pdts[80007944] = ['10:30', '13:30', '16:30'];

export const [mk, ep, hs, ak] = data.parks;

export const mickey = {
  id: 'mickey',
  name: 'Mickey Mouse',
};
export const minnie = {
  id: 'minnie',
  name: 'Minnie Mouse',
};
export const pluto = {
  id: 'pluto',
  name: 'Pluto',
};
export const donald = {
  id: 'donald',
  name: 'Donald Duck',
  ineligibleReason: 'INVALID_PARK_ADMISSION' as const,
};

export const hm: PlusExperience = {
  id: '80010208',
  name: 'Haunted Mansion',
  type: 'ATTRACTION',
  standby: { available: true, waitTime: 30 },
  flex: { available: true, nextAvailableTime: '14:30:00' },
  priority: 7,
};

export const jc: PlusExperience = {
  id: '80010153',
  name: 'Jungle Cruise',
  type: 'ATTRACTION',
  standby: { available: true, waitTime: 45 },
  flex: {
    available: true,
    nextAvailableTime: '18:00:00',
    preexistingPlan: true,
  },
  priority: 1,
};

export const sm: PlusExperience = {
  id: '80010192',
  name: 'Splash Mountain',
  type: 'ATTRACTION',
  standby: { available: true, waitTime: 60 },
  flex: { available: true, nextAvailableTime: '12:45:00' },
  priority: 6,
};

export const offer: Offer = {
  id: '123',
  start: { date: '2022-07-17', time: '11:25:00' },
  end: { date: '2022-07-17', time: '12:25:00' },
  changeStatus: 'NONE' as const,
};

export const booking = {
  experience: { id: hm.id, name: hm.name },
  park: mk,
  start: { date: '2022-07-17', time: '11:25:00' },
  end: { date: '2022-07-17', time: '12:25:00' },
  cancellable: true,
  guests: [
    { ...mickey, entitlementId: 'hm1125_01' },
    { ...minnie, entitlementId: 'hm1125_02' },
    { ...pluto, entitlementId: 'hm1125_03' },
  ],
};

export const multiExp = {
  experience: { id: '', name: 'Multiple Experiences' },
  park: mk,
  start: { date: '2022-07-17', time: '15:15:00' },
  end: { date: '2022-07-17' },
  cancellable: false,
  guests: [
    { ...mickey, entitlementId: 're1515_01', redemptions: 1 },
    { ...minnie, entitlementId: 're1515_02', redemptions: 1 },
    { ...pluto, entitlementId: 're1515_03', redemptions: 1 },
  ],
  choices: [hm, jc, sm].map(({ id, name }) => ({ id, name })),
};

export const allDayExp = {
  experience: { id: sm.id, name: sm.name },
  park: mk,
  start: {},
  end: {},
  cancellable: false,
  guests: [{ ...pluto, entitlementId: 'sm_01', redemptions: 1 }],
};

export const bookings: Booking[] = [
  allDayExp,
  booking,
  {
    experience: { id: jc.id, name: jc.name },
    park: mk,
    start: { date: '2022-07-17', time: '14:00:00' },
    end: { date: '2022-07-17', time: '15:00:00' },
    cancellable: true,
    guests: [
      { ...mickey, entitlementId: 'jc1400_01' },
      { ...minnie, entitlementId: 'jc1400_02' },
    ],
  },
  multiExp,
];

const stack = new BookingStack(false);
stack.update([bookings[1]]);
stack.update(bookings);

export const client = new GenieClient({
  origin: 'https://disneyworld.disney.go.com',
  authStore: {
    getData: () => ({ swid: '', accessToken: '' }),
    setData: () => null,
    deleteData: () => null,
  },
  data,
}) as jest.Mocked<GenieClient>;

jest.spyOn(client, 'guests').mockResolvedValue({
  eligible: [mickey, minnie, pluto],
  ineligible: [donald],
});
jest.spyOn(client, 'offer').mockResolvedValue(offer);
jest.spyOn(client, 'cancelOffer').mockResolvedValue(undefined);
jest.spyOn(client, 'book').mockResolvedValue({ ...booking });
jest.spyOn(client, 'cancelBooking').mockResolvedValue(undefined);
jest.spyOn(client, 'bookings').mockResolvedValue([...bookings]);
jest.spyOn(client, 'plusExperiences').mockResolvedValue([hm, sm, jc]);
jest.spyOn(client, 'pdt').mockReturnValue('13:30');
