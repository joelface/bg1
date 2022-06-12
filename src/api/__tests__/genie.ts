import { fetchJson } from '/fetch';
import { setTime, waitFor } from '/testing';
import {
  hm,
  jc,
  sm,
  mk,
  mickey,
  minnie,
  donald,
  pluto,
  bookings,
} from '/__fixtures__/genie';
import {
  Booking,
  BookingStack,
  GenieClient,
  Guest,
  isGenieOrigin,
  RequestError,
} from '../genie';
import wdw from '../data/wdw';

jest.mock('/fetch');
const fetchJsonMock = fetchJson as jest.MockedFunction<typeof fetchJson>;

const accessToken = 'access_token_123';
const swid = '{abc}';
const origin = 'https://disneyworld.disney.go.com';
hm.priority = undefined;

function response(data: any, status = 200) {
  return { status, data: { ...data } };
}

function respond(...responses: ReturnType<typeof response>[]) {
  for (const res of responses) fetchJsonMock.mockResolvedValueOnce(res);
}

function expectFetch(
  path: string,
  { method, params, data }: Parameters<typeof fetchJson>[1] = {},
  appendUserId = true,
  nthCall = 1
) {
  params ||= {};
  if (appendUserId) params = { ...params, userId: swid };
  expect(fetchJsonMock).nthCalledWith(
    nthCall,
    expect.stringContaining(origin + path),
    {
      method: method || 'GET',
      params,
      data,
      headers: {
        Authorization: `BEARER ${accessToken}`,
      },
    }
  );
}

function splitName({ name, ...rest }: Guest) {
  const [firstName, lastName = ''] = name.split(' ');
  return { ...rest, firstName, lastName };
}

describe('isGenieOrigin()', () => {
  it('returns true when Genie origin', () => {
    expect(isGenieOrigin('https://disneyworld.disney.go.com')).toBe(true);
    expect(isGenieOrigin('https://disneyland.disney.go.com')).toBe(true);
  });
  it('returns false when not Genie origin', () => {
    expect(isGenieOrigin('https://example.com')).toBe(false);
  });
});

describe('GenieClient', () => {
  const authStore = {
    getData: () => ({ accessToken, swid }),
    setData: () => null,
    deleteData: jest.fn(),
  };
  const client = new GenieClient({
    origin: 'https://disneyworld.disney.go.com',
    authStore,
    data: wdw,
  });
  const onUnauthorized = jest.fn();
  client.onUnauthorized = onUnauthorized;
  const guests = [minnie, pluto, mickey];
  const ineligibleGuests = [donald];
  const guestsRes = response({
    guests: guests.map(splitName),
    ineligibleGuests: ineligibleGuests.map(splitName),
    primaryGuestId: mickey.id,
  });

  beforeEach(() => {
    fetchJsonMock.mockReset();
    authStore.deleteData.mockReset();
    onUnauthorized.mockReset();
  });

  describe('isRebookable()', () => {
    it('returns true if booking is rebookable', () => {
      expect(client.isRebookable(bookings[2])).toBe(true);
      expect(client.isRebookable(bookings[1])).toBe(false);
    });
  });

  describe('primaryGuestId()', () => {
    it('returns primary guest ID', async () => {
      respond(guestsRes);
      const args = { experience: hm, park: mk };
      expect(await client.primaryGuestId(args)).toBe(mickey.id);
      expect(await client.primaryGuestId(args)).toBe(mickey.id);
      expect(fetchJsonMock).toBeCalledTimes(1);
    });
  });

  describe('load()', () => {
    it('loads Genie client', async () => {
      const client = await GenieClient.load({
        origin: 'https://disneyland.disney.go.com',
        authStore,
      });
      expect(client.parks.map(p => p.name)).toEqual([
        'Disneyland',
        'California Adventure',
      ]);
    });
  });

  describe('resort', () => {
    it('returns resort abbreviation', () => {
      expect(client.resort).toBe('WDW');
    });
  });

  describe('plusExperiences()', () => {
    it('returns Genie+ experiences', async () => {
      respond(response({ availableExperiences: [hm] }));
      expect(await client.plusExperiences(mk)).toEqual([
        { ...hm, ...wdw.experiences['80010208'] },
      ]);
      expectFetch(
        `/tipboard-vas/api/v1/parks/${encodeURIComponent(mk.id)}/experiences`
      );
    });
  });

  describe('guests()', () => {
    const guestsUrl = '/ea-vas/api/v1/guests';

    it('returns eligible guests for experience', async () => {
      respond(guestsRes);
      expect(await client.guests({ experience: hm, park: mk })).toEqual({
        eligible: [mickey, minnie, pluto],
        ineligible: ineligibleGuests,
      });
      expectFetch(guestsUrl, {
        params: {
          productType: 'FLEX',
          experienceId: hm.id,
          parkId: mk.id,
        },
      });
    });

    it('treats any guests with ineligibleReason as ineligible', async () => {
      respond(
        response({
          guests: [donald].map(splitName),
          ineligibleGuests: [],
          primaryGuestId: mickey.id,
        })
      );
      expect(await client.guests({ experience: hm, park: mk })).toEqual({
        eligible: [],
        ineligible: [donald],
      });
    });

    it('sorts ineligible guests', async () => {
      const fifi = {
        id: 'fifi',
        firstName: 'Fifi',
        lastName: '',
        ineligibleReason: 'TOO_EARLY',
        eligibleAfter: '10:30:00',
      };
      respond(
        response({
          guests: [],
          ineligibleGuests: [
            {
              ...mickey,
              ineligibleReason: 'EXPERIENCE_LIMIT_REACHED',
            },
            {
              ...minnie,
              ineligibleReason: 'TOO_EARLY',
              eligibleAfter: '10:30:00',
            },
            {
              ...pluto,
              ineligibleReason: 'TOO_EARLY',
              eligibleAfter: '10:00:00',
            },
            donald,
            fifi,
          ],
          primaryGuestId: mickey.id,
        })
      );
      const { ineligible } = await client.guests({
        experience: hm,
        park: mk,
      });
      expect(ineligible.map(g => g.id)).toEqual(
        [pluto, fifi, minnie, mickey, donald].map(g => g.id)
      );
    });
  });

  describe('offer()', () => {
    const offer = {
      id: 'offer1',
      date: '2022-07-17',
      startTime: '14:30:00',
      endTime: '15:30:00',
      changeStatus: 'NONE',
    };
    const offerRes = response({ offer }, 201);

    it('obtains Lightning Lane offer', async () => {
      respond(offerRes);
      expect(await client.offer({ experience: hm, park: mk, guests })).toEqual({
        id: offer.id,
        start: { date: offer.date, time: offer.startTime },
        end: { date: offer.date, time: offer.endTime },
        changeStatus: 'NONE',
      });
      expectFetch('/ea-vas/api/v1/products/flex/offers', {
        method: 'POST',
        data: {
          productType: 'FLEX',
          guestIds: guests.map(g => g.id),
          primaryGuestId: mickey.id,
          parkId: mk.id,
          experienceId: hm.id,
          selectedTime: '14:30:00',
        },
      });
    });
  });

  describe('cancelOffer()', () => {
    it('cancels offer', async () => {
      respond(response({}, 204));
      const offer = { id: 'offer1' };
      await client.cancelOffer(offer);
      expectFetch(
        '/ea-vas/api/v1/offers/' + offer.id,
        {
          method: 'DELETE',
          params: { productType: 'FLEX' },
        },
        false
      );
    });
  });

  describe('book()', () => {
    it('books Lightning Lanes', async () => {
      const guests = [mickey, minnie];
      const offer = {
        id: 'offer1',
        start: { date: '2022-07-17', time: '18:00:00' },
        end: { date: '2022-07-17', time: '19:00:00' },
        changeStatus: 'NONE',
      };
      const entitlement = (guest: { id: string }) => ({
        id: 'entitlement-' + guest.id,
        guestId: guest.id,
        usageDetails: {
          status: 'BOOKED',
          redeemable: true,
          modifiable: true,
        },
      });
      const newBooking = {
        id: 'NEW_BOOKING',
        entitlements: guests.map(g => entitlement(g)),
        startDateTime: `${offer.start.date}T${offer.start.time}`,
        endDateTime: `${offer.end.date}T${offer.end.time}`,
        assignmentDetails: {
          product: 'INDIVIDUAL',
          reason: 'OTHER',
        },
        singleExperienceDetails: {
          experienceId: hm.id,
          parkId: mk.id,
        },
      };
      respond(response({ booking: newBooking }, 201), guestsRes);
      expect(await client.book(offer)).toEqual({
        experience: { id: hm.id, name: hm.name },
        park: mk,
        start: offer.start,
        end: offer.end,
        cancellable: true,
        guests: guests.map((g, i) => ({
          ...g,
          entitlementId: newBooking.entitlements[i].id,
        })),
      });
      expectFetch(
        '/ea-vas/api/v1/products/flex/bookings',
        {
          method: 'POST',
          data: { offerId: offer.id },
        },
        false
      );
    });

    it('throws RequestError on failure', async () => {
      respond(response({}, 410));
      await expect(client.book({ id: 'offer1' })).rejects.toThrow(RequestError);
    });
  });

  describe('cancelBooking()', () => {
    const booking = bookings[0];

    it('cancel booking', async () => {
      respond(response({}));
      await client.cancelBooking(booking.guests);
      expectFetch(
        `/ea-vas/api/v1/entitlements/${booking.guests
          .map(g => g.entitlementId)
          .join(',')}`,
        { method: 'DELETE' },
        false
      );
    });
  });

  describe('bookings()', () => {
    function createBookingsResponse(bookings: Booking[]) {
      const xid = (guest: { id: string }) => guest.id + ';type=xid';
      return response({
        items: [
          {
            // This item should be ignored
            type: 'FASTPASS',
            kind: 'PARK_PASS',
          },
          ...bookings.map(b => ({
            type: 'FASTPASS',
            kind: b.choices ? 'FLEX' : 'OTHER',
            displayStartDate: b.start.date,
            displayStartTime: b.start.time,
            displayEndDate: b.end.date,
            displayEndTime: b.end.time,
            facility:
              (b.choices ? hm : b.experience).id + ';entityType=Attraction',
            guests: b.guests.map(g => ({
              id: xid(g),
              entitlementId: g.entitlementId,
              redemptionsRemaining: g.redemptions,
            })),
            cancellable: b.cancellable,
            multipleExperiences: !!b.choices,
            assets: b.choices
              ? [
                  { content: 'original-id', excluded: false, original: true },
                  ...[hm, jc, sm].map(exp => ({
                    content: exp.id,
                    excluded: false,
                    original: false,
                  })),
                  { content: 'excluded-id', excluded: true, original: false },
                ]
              : undefined,
          })),
        ],
        assets: {
          ...Object.fromEntries(
            bookings.map(b => [
              b.experience.id + ';entityType=Attraction',
              {
                id: b.experience.id + ';entityType=Attraction',
                name: b.experience.name,
                location: b.park.id + ';entityType=theme-park',
              },
            ])
          ),
          ...Object.fromEntries(
            guests.map(g => [
              g.id,
              {
                media: {
                  small: {
                    url: `https://example.com/${g.id}.jpg`,
                  },
                },
              },
            ])
          ),
        },
        profiles: Object.fromEntries(
          guests.map(g => {
            const [firstName, lastName = ''] = g.name.split(' ');
            return [
              xid(g),
              {
                id: xid(g),
                name: { firstName, lastName },
                avatarId: g.id,
              },
            ];
          })
        ),
      });
    }
    const bookingsRes = createBookingsResponse(bookings);
    const nowMock = jest.spyOn(Date, 'now');

    it('returns current bookings', async () => {
      nowMock.mockReturnValueOnce(new Date('2022-07-17 12:40:00').getTime());
      respond(bookingsRes);
      expect(await client.bookings()).toEqual(bookings);
    });

    it('returns only unexpired bookings', async () => {
      nowMock.mockReturnValueOnce(new Date('2022-07-17 12:41:00').getTime());
      respond(bookingsRes);
      expect(await client.bookings()).toEqual([
        bookings[0],
        bookings[2],
        bookings[3],
      ]);
    });

    it('uses names defined in park data files', async () => {
      const bs = {
        experience: {
          id: '16491297',
          name: 'The Barnstormer',
        },
        park: mk,
        start: { date: undefined, time: undefined },
        end: { date: undefined, time: undefined },
        cancellable: false,
        guests: [],
      };
      const bookings = [bs];
      respond(createBookingsResponse(bookings));
      expect(await client.bookings()).toEqual([
        { ...bs, experience: { ...bs.experience, name: 'Barnstormer' } },
      ]);
    });
  });

  describe('pdt()', () => {
    it('returns next PDT', () => {
      setTime('10:30:59');
      expect(client.pdt(mk)).toBe('10:30');
      setTime('10:31:00');
      expect(client.pdt(mk)).toBe('13:30');
      setTime('13:31:00');
      expect(client.pdt(mk)).toBe('16:30');
      setTime('16:31:00');
      expect(client.pdt(mk)).toBe(undefined);
    });
  });

  describe('logOut()', () => {
    it('calls onUnauthorized() and authStore.deleteData()', () => {
      client.logOut();
      expect(onUnauthorized).toBeCalledTimes(1);
      expect(authStore.deleteData).toBeCalledTimes(1);
    });

    it('is called on 401 Unauthorized response', async () => {
      respond({ status: 401, data: {} });
      await expect(client.plusExperiences(mk)).rejects.toThrow(RequestError);
      await waitFor(() => expect(onUnauthorized).toBeCalledTimes(1));
    });
  });
});

describe('BookingStack', () => {
  localStorage.clear();
  const stack = new BookingStack();

  describe('update()', () => {
    it('updates most recent booking', () => {
      stack.update([bookings[2]]);
      expect(stack.isRebookable(bookings[2])).toBe(true);
      stack.update(bookings);
      expect(stack.isRebookable(bookings[1])).toBe(true);
      expect(stack.isRebookable(bookings[0])).toBe(false);
      expect(stack.isRebookable(bookings[2])).toBe(false);
      expect(stack.isRebookable(bookings[3])).toBe(false);
    });
  });
});
