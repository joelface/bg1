import {
  booking,
  hm,
  jc,
  mk,
  renderResort,
  sm,
  wdw,
} from '@/__fixtures__/genie';
import { FlexExperience } from '@/api/genie';
import { BookingDateContext } from '@/contexts/BookingDate';
import { ExperiencesContext } from '@/contexts/Experiences';
import { Nav } from '@/contexts/Nav';
import { ParkContext } from '@/contexts/Park';
import { PlansContext } from '@/contexts/Plans';
import { displayTime } from '@/datetime';
import kvdb from '@/kvdb';
import { TODAY, click, loading, screen, see, setTime, within } from '@/testing';

import GeniePlusList, { STARRED_KEY } from '../GeniePlusList';

setTime('10:00');
const refreshExperiences = jest.fn();

const getExperiences = (
  testId: 'experienced' | 'unexperienced' = 'unexperienced'
) => {
  const list = screen.queryByTestId(testId);
  if (!list) return null;
  return within(list)
    .getAllByRole('heading')
    .map(h => h.textContent);
};

const names = (exps: { name: string }[]) => exps.map(({ name }) => name);

const bz: FlexExperience = {
  ...wdw.experience('80010114'),
  park: mk,
  type: 'ATTRACTION',
  standby: { available: false },
  flex: { available: false },
};

const db: FlexExperience = {
  ...wdw.experience('80010129'),
  park: mk,
  type: 'ATTRACTION',
  standby: { available: true, waitTime: 25 },
  flex: { available: true, nextAvailableTime: '10:05:00' },
};

async function goBack() {
  history.back();
  await see.screen('LL');
}

describe('GeniePlusList', () => {
  it('shows LL availability', async () => {
    kvdb.set(STARRED_KEY, [bz.id]);
    renderResort(
      <BookingDateContext.Provider
        value={{ bookingDate: TODAY, setBookingDate: () => {} }}
      >
        <ParkContext.Provider value={{ park: mk, setPark: () => {} }}>
          <PlansContext.Provider
            value={{
              plans: [booking],
              refreshPlans: () => {},
              loaderElem: null,
            }}
          >
            <ExperiencesContext.Provider
              value={{
                experiences: [
                  { ...hm },
                  { ...db, experienced: true },
                  { ...bz, experienced: true },
                  { ...jc, experienced: true },
                  sm,
                ],
                refreshExperiences,
                loaderElem: null,
              }}
            >
              <Nav>
                <GeniePlusList contentRef={{ current: null }} />
              </Nav>
            </ExperiencesContext.Provider>
          </PlansContext.Provider>
        </ParkContext.Provider>
      </BookingDateContext.Provider>
    );

    click('Refresh Experiences');
    expect(refreshExperiences).toHaveBeenCalledTimes(1);

    const inSM = within(see(sm.name).closest('li') as HTMLElement);
    inSM.getByTitle('Lightning Pick (more info)');

    const inHM = within(see(hm.name).closest('li') as HTMLElement);
    inHM.getByTitle('Upcoming Drop (more info)');
    inHM.getByTitle('Booked (more info)');

    expect(see.all('Lightning Pick (more info)')).toHaveLength(1);
    expect(see.all('Upcoming Drop (more info)')).toHaveLength(1);
    expect(see.all('Booked (more info)')).toHaveLength(1);

    click('Booked (more info)');
    await see.screen('Booked');
    await goBack();

    click('Lightning Pick (more info)');
    await see.screen('Lightning Pick');
    await goBack();

    click('Upcoming Drop (more info)');
    await see.screen('Upcoming Drop');
    expect(see.all(displayTime(mk.dropTimes[0]))).toHaveLength(1);
    expect(see.all(displayTime(mk.dropTimes[1]))).toHaveLength(3);
    expect(see.all(displayTime(mk.dropTimes[2]))).toHaveLength(1);
    see(hm.name, 'heading');
    see(sm.name, 'heading');
    await goBack();

    expect(getExperiences()).toEqual(names([bz, sm, hm]));
    expect(getExperiences('experienced')).toEqual(names([db, jc]));

    click('Remove from Favorites');
    expect(getExperiences()).toEqual(names([sm, hm]));

    click(screen.getAllByTitle('Add to Favorites')[4]);
    expect(getExperiences()).toEqual(names([jc, sm, hm]));

    click(displayTime(sm.flex.nextAvailableTime as string));
    await see.screen('Lightning Lane');
    await loading();
    see(sm.name);
  });
});
