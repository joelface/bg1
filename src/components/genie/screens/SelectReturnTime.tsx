import { useCallback, useEffect, useState } from 'react';

import { HourlySlots, Offer } from '@/api/genie';
import Button from '@/components/Button';
import Screen from '@/components/Screen';
import { useClients } from '@/contexts/Clients';
import { useNav } from '@/contexts/Nav';
import { useRebooking } from '@/contexts/Rebooking';
import { displayTime } from '@/datetime';
import useDataLoader from '@/hooks/useDataLoader';

import BookingDate from '../BookingDate';
import PlansButton from '../PlansButton';
import RebookingHeader from '../RebookingHeader';
import ReturnTime from '../ReturnTime';
import RefreshButton from './RefreshButton';

export default function SelectReturnTime<B extends Offer['booking']>({
  offer,
  onOfferChange,
}: {
  offer: Offer<B>;
  onOfferChange: (offer: Offer<B>) => void;
}) {
  const { goBack } = useNav();
  const { ll } = useClients();
  const rebooking = useRebooking();
  const { loadData, loaderElem } = useDataLoader();
  const [times, setTimes] = useState<HourlySlots>();
  const { booking } = offer;
  const bookingTimeChange = booking && !rebooking.current;

  const refreshTimes = useCallback(() => {
    function insertOfferTime(times: HourlySlots) {
      const offerTime = offer.start.time;
      if (!booking || offerTime === booking.start.time) return times;
      const offerSlot = {
        startTime: offerTime,
        endTime: offer.end.time,
      };
      const getHour = (time: string) => Number(time.split(':')[0]);
      const offerHour = getHour(offerTime);
      const hours = times.map(slots => getHour(slots[0].startTime));
      const hourIdx = hours.findIndex(hour => hour >= offerHour);
      const hour = hours[hourIdx];
      const slots = times[hourIdx] ?? [];
      if (hourIdx === -1) {
        times.push([offerSlot]);
      } else if (hour > offerHour) {
        times.splice(hourIdx, 0, [offerSlot]);
      } else if (offerTime < slots[0].startTime) {
        if (slots.length < 3) {
          slots.unshift(offerSlot);
        } else {
          slots[0] = offerSlot;
        }
      }
      return times;
    }
    loadData(async () => {
      const times = await ll.times(offer);
      setTimes(bookingTimeChange ? insertOfferTime(times) : times);
    });
  }, [offer, booking, bookingTimeChange, ll, loadData]);

  useEffect(refreshTimes, [refreshTimes]);

  return (
    <Screen
      title="Select Return Time"
      buttons={
        <>
          <PlansButton />
          <RefreshButton name="Times" onClick={refreshTimes} />
        </>
      }
      subhead={
        <>
          <RebookingHeader />
          <BookingDate />
        </>
      }
      theme={offer.experience.park.theme}
    >
      <h2>{offer.experience.name}</h2>
      <div>{offer.experience.park.name}</div>
      {offer && (
        <ReturnTime
          {...(bookingTimeChange ? booking : offer)}
          button={
            <Button type="small" onClick={goBack}>
              Keep
            </Button>
          }
        />
      )}
      {!times ? null : times.length > 0 ? (
        <>
          <h3>More Available Times</h3>
          <table className="whitespace-nowrap">
            <tbody>
              {times.map(slots => (
                <tr key={slots[0].startTime}>
                  <th
                    scope="row"
                    className="pt-3 pr-2 text-gray-500 text-sm font-semibold text-right uppercase"
                  >
                    {displayTime(slots[0].startTime.slice(0, 2))}
                  </th>
                  {slots.map(slot => (
                    <td className="pt-3 pr-3 text-center" key={slot.startTime}>
                      <Button
                        onClick={() => {
                          loadData(async () => {
                            const newOffer =
                              slot.startTime === offer.start.time
                                ? offer
                                : await ll.changeOfferTime(offer, slot);
                            await goBack();
                            onOfferChange(newOffer);
                          });
                        }}
                      >
                        {displayTime(slot.startTime)}
                      </Button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>No other times available</p>
      )}
      {loaderElem}
    </Screen>
  );
}
