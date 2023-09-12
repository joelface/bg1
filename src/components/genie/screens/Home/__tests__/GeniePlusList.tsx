import { hm, jc, mk, sm, wdw } from '@/__fixtures__/genie';
import { Experience } from '@/api/data';
import { PlusExperience } from '@/api/genie';
import { ExperiencesProvider } from '@/contexts/Experiences';
import { useGenieClient } from '@/contexts/GenieClient';
import { Nav } from '@/contexts/Nav';
import { ParkProvider } from '@/contexts/Park';
import { displayTime } from '@/datetime';
import {
  click,
  loading,
  render,
  screen,
  see,
  setTime,
  within,
} from '@/testing';

import GeniePlusList, { STARRED_KEY } from '../GeniePlusList';

jest.mock('@/contexts/GenieClient');

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

const bz: PlusExperience = {
  ...(wdw.experiences['80010114'] as Experience),
  id: '80010114',
  park: mk,
  type: 'ATTRACTION',
  standby: { available: false },
  flex: { available: false },
};

const db: PlusExperience = {
  ...(wdw.experiences['80010129'] as Experience),
  id: '80010129',
  park: mk,
  type: 'ATTRACTION',
  standby: { available: true, waitTime: 25 },
  flex: { available: true, nextAvailableTime: '10:05:00' },
};

async function goBack() {
  history.back();
  await see.screen('Genie+');
}

describe('GeniePlusList', () => {
  const client = useGenieClient();

  it('shows Genie+ availability', async () => {
    localStorage.setItem(STARRED_KEY, JSON.stringify([bz.id]));
    render(
      <ParkProvider value={{ park: mk, setPark: () => null }}>
        <ExperiencesProvider
          value={{
            experiences: [
              { ...hm, experienced: true, drop: true },
              { ...db, experienced: true },
              { ...bz, experienced: true },
              { ...jc },
              { ...sm, drop: true },
            ],
            refreshExperiences,
            loaderElem: null,
          }}
        >
          <Nav>
            <GeniePlusList contentRef={{ current: null }} />
          </Nav>
        </ExperiencesProvider>
      </ParkProvider>
    );

    click('Refresh Experiences');
    expect(refreshExperiences).toBeCalledTimes(1);

    const inJC = within(see(jc.name).closest('li') as HTMLElement);
    inJC.getByTitle('Booked (more info)');

    const inSM = within(see(sm.name).closest('li') as HTMLElement);
    inSM.getByTitle('Lightning Pick (more info)');

    const inHM = within(see(hm.name).closest('li') as HTMLElement);
    inHM.getByTitle('Upcoming Drop (more info)');

    click('Booked (more info)');
    await see.screen('Booked');
    await goBack();

    click('Lightning Pick (more info)');
    await see.screen('Lightning Pick');
    await goBack();

    click('Upcoming Drop (more info)');
    await see.screen('Upcoming Drop');
    expect(see.all(displayTime(client.upcomingDrops(mk)[0].time))).toHaveLength(
      2
    );
    see(displayTime(client.upcomingDrops(mk)[1].time));
    expect(see.all(sm.name)).toHaveLength(2);
    expect(see.all(hm.name)).toHaveLength(2);
    await goBack();

    expect(getExperiences()).toEqual(names([bz, sm, jc]));
    expect(getExperiences('experienced')).toEqual(names([db, hm]));

    click('Remove from Favorites');
    expect(getExperiences()).toEqual(names([sm, jc]));

    click(screen.getAllByTitle('Add to Favorites')[4]);
    expect(getExperiences()).toEqual(names([hm, sm, jc]));

    click(displayTime(sm.flex.nextAvailableTime as string));
    await see.screen('Lightning Lane');
    await loading();
    see(sm.name);
  });
});
