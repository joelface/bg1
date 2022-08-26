import { useCallback, useEffect, useState } from 'react';

import { Booking, Guest, Offer, Park, PlusExperience } from '@/api/genie';
import { useGenieClient } from '@/contexts/GenieClient';
import { Party, PartyProvider } from '@/contexts/Party';
import { useRebooking } from '@/contexts/Rebooking';
import useDataLoader from '@/hooks/useDataLoader';
import RefreshIcon from '@/icons/RefreshIcon';
import { ping } from '@/ping';
import Button from '../Button';
import Page from '../Page';
import BookingDetails from './BookingDetails';
import OfferDetails from './OfferDetails';
import Prebooking from './Prebooking';
import NoEligibleGuests from './NoEligibleGuests';
import NoGuestsFound from './NoGuestsFound';
import NoReservationsAvailable from './NoReservationsAvailable';
import RebookingHeader from './RebookingHeader';
import YLLButton from './YLLButton';

export default function BookExperience({
  experience,
  park,
  onClose,
}: {
  experience: PlusExperience;
  park: Park;
  onClose: () => void;
}) {
  const client = useGenieClient();
  const rebooking = useRebooking();
  const [party, setParty] = useState<Party>();
  const [prebooking, setPrebooking] = useState(
    !experience.flex.available &&
      experience.flex.enrollmentStartTime !== undefined
  );
  const [offer, setOffer] = useState<Offer | null | undefined>(
    prebooking ? null : undefined
  );
  const [booking, setBooking] = useState<Booking>();
  const { loadData, loaderElem } = useDataLoader();

  async function book() {
    if (!offer || !party) return;
    let booking: Booking | null = null;

    await loadData(
      async () => {
        const selectedIds = new Set(party.selected.map(g => g.id));

        if (rebooking.current) {
          await client.cancelBooking(
            rebooking.current.guests.filter(g => selectedIds.has(g.id))
          );
        }

        try {
          booking = await client.book(offer);
        } finally {
          rebooking.end();
        }

        const guestsToCancel = booking.guests.filter(
          g => !selectedIds.has(g.id)
        );
        if (guestsToCancel.length > 0) {
          await client.cancelBooking(guestsToCancel);
          booking.guests = booking.guests.filter(g => selectedIds.has(g.id));
        }
        ping();
      },
      { 410: 'Offer expired' }
    );

    if (booking) setBooking(booking);
  }

  function checkAvailability() {
    loadData(async flash => {
      const { plus } = await client.experiences(park);
      const exp = plus.find(exp => exp.id === experience.id);
      if (exp?.flex.available) {
        setPrebooking(false);
        setOffer(undefined);
      } else {
        flash('Reservations not open yet');
      }
    });
  }

  function cancel() {
    if (offer) client.cancelOffer(offer);
    onClose();
  }

  const loadParty = useCallback(() => {
    loadData(async () => {
      try {
        let guests = await client.guests({
          experience,
          park,
        });
        const oldBooking = rebooking.current;
        if (oldBooking) {
          const oldGuestIds = new Set(oldBooking.guests.map(g => g.id));
          const ineligible = [...guests.eligible, ...guests.ineligible].filter(
            g =>
              oldGuestIds.has(g.id) &&
              !(
                g.ineligibleReason === 'TOO_EARLY' ||
                (g.ineligibleReason === 'EXPERIENCE_LIMIT_REACHED' &&
                  experience.id === oldBooking.experience.id)
              )
          );
          guests =
            ineligible.length > 0
              ? { eligible: [], ineligible }
              : { eligible: oldBooking.guests, ineligible: [] };
        }
        setParty({
          ...guests,
          selected: guests.eligible.slice(0, client.maxPartySize),
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
        });
      } catch (error) {
        setParty({
          eligible: [],
          ineligible: [],
          selected: [],
          setSelected: () => null,
        });
        throw error;
      }
    });
  }, [client, experience, park, rebooking, loadData]);

  useEffect(() => {
    if (!party) loadParty();
  }, [party, loadParty]);

  const refreshOffer = useCallback(
    (event?: React.MouseEvent<HTMLButtonElement>) => {
      if (!party || party.selected.length === 0) return;
      loadData(
        async () => {
          try {
            const newOffer = await client.offer({
              experience,
              park,
              guests: party.selected,
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
              if (offer) newOffer.changed = false;
              setOffer(newOffer);
            }
          } catch (error) {
            if (!event) setOffer(null);
            throw error;
          }
        },
        { 410: offer ? 'No reservations available' : '' }
      );
    },
    [client, experience, park, party, offer, loadData]
  );

  useEffect(() => {
    if (offer === undefined) refreshOffer();
  }, [offer, refreshOffer]);

  if (booking) {
    return <BookingDetails booking={booking} onClose={onClose} isNew={true} />;
  }

  const noGuestsFound =
    party?.eligible.length === 0 && party?.ineligible.length === 0;

  return (
    <Page
      heading="Lightning Lane"
      theme={park.theme}
      buttons={
        <>
          <YLLButton />
          {party && (prebooking || offer || noGuestsFound) && (
            <Button onClick={cancel}>Cancel</Button>
          )}
          {!prebooking && offer !== undefined && (
            <Button onClick={refreshOffer} title="Refresh Offer">
              <RefreshIcon />
            </Button>
          )}
        </>
      }
    >
      <RebookingHeader />
      <h2>{experience.name}</h2>
      <div>{park.name}</div>
      <PartyProvider
        value={
          party || {
            eligible: [],
            ineligible: [],
            selected: [],
            setSelected: () => null,
          }
        }
      >
        {party?.eligible.length === 0 ? (
          noGuestsFound ? (
            <NoGuestsFound onRefresh={loadParty} />
          ) : (
            <NoEligibleGuests onClose={onClose} />
          )
        ) : !party || offer === undefined ? (
          <div />
        ) : prebooking ? (
          <Prebooking
            startTime={experience.flex.enrollmentStartTime}
            onRefresh={checkAvailability}
          />
        ) : offer === null ? (
          <NoReservationsAvailable onClose={onClose} />
        ) : (
          <OfferDetails offer={offer} onBook={book} />
        )}
      </PartyProvider>
      {loaderElem}
    </Page>
  );
}
