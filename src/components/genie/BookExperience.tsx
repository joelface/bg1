import { useCallback, useEffect, useState } from 'react';

import { Booking, Guest, Offer, Park, PlusExperience } from '/api/genie';
import { useGenieClient } from '/contexts/GenieClient';
import { Party, PartyProvider } from '/contexts/Party';
import { useRebooking } from '/contexts/Rebooking';
import useDataLoader from '/hooks/useDataLoader';
import RefreshIcon from '/icons/RefreshIcon';
import Button from '../Button';
import Page from '../Page';
import BookingDetails from './BookingDetails';
import OfferDetails from './OfferDetails';
import Prebooking from './Prebooking';
import NoEligibleGuests from './NoEligibleGuests';
import NoGuestsFound from './NoGuestsFound';
import NoReservationsAvailable from './NoReservationsAvailable';
import RebookingHeader from './RebookingHeader';

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
  const [available, setAvailable] = useState(experience.flex.available);
  const [offer, setOffer] = useState<Offer | null | undefined>(
    available ? undefined : null
  );
  const [booking, setBooking] = useState<Booking>();
  const { loadData, loaderElem, isLoading } = useDataLoader();

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
      },
      { 410: 'Offer expired' }
    );

    if (booking) setBooking(booking);
  }

  function checkAvailability() {
    loadData(async flash => {
      const experiences = await client.plusExperiences(park);
      const exp = experiences.find(exp => exp.id === experience.id);
      if (exp?.flex.available) {
        setAvailable(true);
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

  function refreshOffer() {
    if (!party || party.eligible.length === 0) return;
    loadData(
      async () => {
        const newOffer = await client.offer({
          experience,
          park,
          guests: party.eligible,
        });
        setOffer(offer => {
          if (offer) client.cancelOffer(offer);
          return newOffer;
        });
      },
      { 410: 'No reservations available' }
    );
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
              if (selected.some(g => !oldSelected.has(g))) {
                setOffer(offer => {
                  if (!offer) return offer;
                  client.cancelOffer(offer);
                  return undefined;
                });
              }
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

  useEffect(loadParty, [loadParty]);

  useEffect(() => {
    if (offer !== undefined || !party || party.selected.length === 0) return;
    loadData(
      async () => {
        try {
          setOffer(
            await client.offer({
              experience,
              park,
              guests: [...party.selected],
            })
          );
        } catch (error) {
          setOffer(null);
          throw error;
        }
      },
      { 410: '' }
    );
  }, [client, experience, park, party, offer, loadData]);

  if (booking) {
    return <BookingDetails booking={booking} onClose={onClose} isNew={true} />;
  }

  return (
    <Page
      heading="Lightning Lane"
      theme={park.theme}
      buttons={
        <>
          {(!available || offer !== null) && (
            <Button onClick={cancel}>Cancel</Button>
          )}
          {available && offer !== undefined && (
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
        {party?.eligible?.length === 0 ? (
          isLoading ? (
            <div />
          ) : party.ineligible.length === 0 ? (
            <NoGuestsFound onRefresh={loadParty} />
          ) : (
            <NoEligibleGuests onClose={onClose} />
          )
        ) : offer === undefined ? (
          <div />
        ) : !available ? (
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
