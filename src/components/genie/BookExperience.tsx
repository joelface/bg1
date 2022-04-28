import { h, Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { Booking, Guest, Offer, Park, PlusExperience } from '@/api/genie';
import { useBookingSwap } from '@/contexts/BookingSwap';
import { useGenieClient } from '@/contexts/GenieClient';
import useDataLoader from '@/hooks/useDataLoader';
import RefreshIcon from '@/icons/RefreshIcon';
import Button from '../Button';
import FloatingButton from '../FloatingButton';
import Page from '../Page';
import BookingDetails from './BookingDetails';
import BookingSwapPane from './BookingSwapPane';
import OfferDetails from './OfferDetails';
import Prebooking from './Prebooking';

export default function BookExperience({
  experience,
  park,
  onClose,
}: {
  experience: PlusExperience;
  park: Park;
  onClose: () => void;
}): h.JSX.Element | null {
  const client = useGenieClient();
  const swap = useBookingSwap();
  const [guests, setGuests] = useState<Guest[]>();
  const [ineligibleGuests, setIneligibleGuests] = useState<Guest[]>([]);
  const [available, setAvailable] = useState(experience.flex.available);
  const [offer, setOffer] = useState<Offer | null | undefined>(
    available ? undefined : null
  );
  const [booking, setBooking] = useState<Booking>();
  const { loadData, loaderElem } = useDataLoader();

  async function book(party: Guest[]) {
    if (!offer) return;
    let booking: Booking | null = null;

    await loadData(
      async () => {
        const partyIds = new Set(party.map(g => g.id));

        if (swap.booking) {
          await client.cancelBooking(
            swap.booking.guests.filter(g => partyIds.has(g.id))
          );
        }

        try {
          booking = await client.book(offer);
        } finally {
          swap.end();
        }

        const guestsToCancel = booking.guests.filter(g => !partyIds.has(g.id));
        if (guestsToCancel.length > 0) {
          await client.cancelBooking(guestsToCancel);
          booking.guests = booking.guests.filter(g => partyIds.has(g.id));
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
    if (!guests || guests.length === 0) return;
    loadData(
      async () => {
        const newOffer = await client.offer({ experience, park, guests });
        setOffer(offer => {
          if (offer) client.cancelOffer(offer);
          return newOffer;
        });
      },
      { 410: 'No reservations available' }
    );
  }

  useEffect(() => {
    if (guests) return;
    loadData(async () => {
      const { guests, ineligibleGuests } = await client.guests({
        experience,
        park,
      });
      const oldBooking = swap.booking;
      if (oldBooking) {
        const eligibleIds = new Set(
          ineligibleGuests
            .filter(
              g =>
                g.ineligibleReason === 'TOO_EARLY' ||
                (g.ineligibleReason === 'EXPERIENCE_LIMIT_REACHED' &&
                  experience.id === oldBooking.experience.id)
            )
            .map(g => g.id)
        );
        setGuests(oldBooking.guests.filter(g => eligibleIds.has(g.id)));
      } else {
        setGuests(guests);
        setIneligibleGuests(ineligibleGuests);
      }
    });
  }, [client, experience, park, guests, swap, loadData]);

  useEffect(() => {
    if (offer !== undefined || !guests || guests.length === 0) return;
    loadData(
      async () => {
        try {
          setOffer(await client.offer({ experience, park, guests }));
        } catch (error) {
          setOffer(null);
          throw error;
        }
      },
      { 410: '' }
    );
  }, [client, experience, park, guests, offer, loadData]);

  if (booking) {
    return <BookingDetails booking={booking} onClose={onClose} isNew={true} />;
  }

  const failScreen = (heading: string, message: string) => (
    <>
      <h3>{heading}</h3>
      <p>{message}</p>
      <FloatingButton onClick={onClose}>Back</FloatingButton>
    </>
  );

  return (
    <Page
      heading="Lightning Lane"
      theme={park.theme}
      buttons={
        <>
          {(!available || offer) && <Button onClick={cancel}>Cancel</Button>}
          {available && guests && guests.length > 0 && (
            <Button onClick={refreshOffer} title="Refresh Offer">
              <RefreshIcon />
            </Button>
          )}
        </>
      }
    >
      <BookingSwapPane />
      <h2>{experience.name}</h2>
      <div>{park.name}</div>
      {guests?.length === 0 ? (
        failScreen(
          'No Eligible Guests',
          'No one in your party is eligible for this Lightning Lane.'
        )
      ) : !guests || offer === undefined ? (
        <div />
      ) : !available ? (
        <Prebooking
          startTime={experience.flex.enrollmentStartTime}
          onRefresh={checkAvailability}
        />
      ) : offer === null ? (
        failScreen(
          'No Reservations Available',
          'Tap the refresh button above to try again or go back to the tip board and select another attraction.'
        )
      ) : (
        <OfferDetails
          offer={offer}
          guests={guests}
          ineligibleGuests={ineligibleGuests}
          onConfirm={book}
        />
      )}
      {loaderElem}
    </Page>
  );
}
