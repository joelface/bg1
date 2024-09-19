import { useCallback, useEffect, useState } from 'react';

import { Guest, Offer, OfferExperience } from '@/api/genie';
import FloatingButton from '@/components/FloatingButton';
import Screen from '@/components/Screen';
import { useBookingDate } from '@/contexts/BookingDate';
import { useClients } from '@/contexts/Clients';
import { useNav } from '@/contexts/Nav';
import { Party, PartyProvider } from '@/contexts/Party';
import { usePlans } from '@/contexts/Plans';
import { useRebooking } from '@/contexts/Rebooking';
import { useResort } from '@/contexts/Resort';
import useDataLoader from '@/hooks/useDataLoader';
import { ping } from '@/ping';

import BookingDate from '../BookingDate';
import PlansButton from '../PlansButton';
import RebookingHeader from '../RebookingHeader';
import NoEligibleGuests from './BookExperience/NoEligibleGuests';
import NoGuestsFound from './BookExperience/NoGuestsFound';
import NoReservationsAvailable from './BookExperience/NoReservationsAvailable';
import OfferDetails from './BookExperience/OfferDetails';
import BookingDetails from './BookingDetails';
import RefreshButton from './RefreshButton';

export default function BookExperience({
  experience,
}: {
  experience: OfferExperience;
}) {
  const { goTo } = useNav();
  const resort = useResort();
  const { ll } = useClients();
  const { refreshPlans } = usePlans();
  const { bookingDate } = useBookingDate();
  const rebooking = useRebooking();
  const [party, setParty] = useState<Party>();
  const [offer, setOffer] = useState<Offer | null | undefined>();
  const { loadData, loaderElem } = useDataLoader();

  async function book() {
    if (!offer || !party) return;
    loadData(
      async () => {
        const booking = await ll.book(offer, party.selected);
        rebooking.end();
        const selectedIds = new Set(party.selected.map(g => g.id));
        const guestsToCancel = booking.guests.filter(
          g => !selectedIds.has(g.id)
        );
        if (guestsToCancel.length > 0) {
          await ll.cancelBooking(guestsToCancel);
          booking.guests = booking.guests.filter(g => selectedIds.has(g.id));
        }
        goTo(<BookingDetails booking={booking} isNew={true} />, {
          replace: true,
        });
        refreshPlans();
        ping(resort, 'G');
      },
      {
        messages: { 410: 'Offer expired' },
      }
    );
  }

  const loadParty = useCallback(() => {
    loadData(async () => {
      const guests = rebooking.current
        ? { eligible: rebooking.current.guests, ineligible: [] }
        : await ll.guests(experience, bookingDate);
      setParty({
        ...guests,
        selected: guests.eligible.slice(0, ll.rules.maxPartySize),
        setSelected: (selected: Guest[]) =>
          setParty(party => {
            if (!party) return party;
            const oldSelected = new Set(party.selected);
            setOffer(offer =>
              offer === null || selected.some(g => !oldSelected.has(g))
                ? undefined
                : offer
            );
            return { ...party, selected };
          }),
        experience,
      });
    });
  }, [ll, experience, bookingDate, rebooking, loadData]);

  useEffect(() => {
    if (!party) loadParty();
  }, [party, loadParty]);

  const refreshOffer = useCallback(
    (first = false) => {
      if (!party || party.selected.length === 0) return;
      loadData(
        async () => {
          try {
            const newOffer = await ll.offer(experience, party.selected, {
              booking: rebooking.current,
              date: bookingDate,
            });
            const { ineligible } = newOffer.guests;
            if (ineligible.length > 0) {
              const ineligibleIds = new Set(ineligible.map(g => g.id));
              const isEligible = (g: Guest) => !ineligibleIds.has(g.id);
              setParty({
                ...party,
                eligible: party.eligible.filter(isEligible),
                ineligible: [...ineligible, ...party.ineligible],
                selected: party.selected.filter(isEligible),
              });
            }
            if (newOffer.active) {
              // If the user is intentionally refreshing, we don't need to warn
              // them that the offer has changed
              if (!first) newOffer.changed = false;
              setOffer(newOffer);
            } else {
              setOffer(offer => offer ?? null);
            }
          } catch (error) {
            if (first) setOffer(offer => offer ?? null);
            throw error;
          }
        },
        {
          messages: { 410: first ? '' : 'No reservations available' },
        }
      );
    },
    [ll, experience, party, bookingDate, rebooking, loadData]
  );

  useEffect(() => {
    if (offer === undefined) refreshOffer(true);
  }, [offer, refreshOffer]);

  const noEligible = party?.eligible.length === 0;
  const noGuestsFound = noEligible && party?.ineligible.length === 0;

  return (
    <Screen
      title="Lightning Lane"
      theme={experience.park.theme}
      buttons={
        <>
          <PlansButton />
          <RefreshButton
            onClick={() => {
              if (noEligible) {
                loadParty();
              } else {
                refreshOffer();
              }
            }}
            name={noEligible ? 'Party' : 'Offer'}
          />
        </>
      }
      subhead={
        <>
          <RebookingHeader />
          <BookingDate booking={offer ?? undefined} />
        </>
      }
    >
      <h2>{experience.name}</h2>
      <div>{experience.park.name}</div>
      {party && (
        <PartyProvider value={party}>
          {noGuestsFound ? (
            <NoGuestsFound onRefresh={loadParty} />
          ) : noEligible ? (
            <NoEligibleGuests />
          ) : !party || offer === undefined ? (
            <div />
          ) : offer === null ? (
            <NoReservationsAvailable />
          ) : (
            <>
              <OfferDetails offer={offer} onOfferChange={setOffer} />
              <FloatingButton onClick={book}>{`${
                rebooking.current ? 'Modify' : 'Book'
              } Lightning Lane`}</FloatingButton>
            </>
          )}
        </PartyProvider>
      )}
      {loaderElem}
    </Screen>
  );
}
