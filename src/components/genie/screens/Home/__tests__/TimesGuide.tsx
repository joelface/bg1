import { party } from '@/__fixtures__/das';
import { mk, wdw } from '@/__fixtures__/genie';
import { DasParty } from '@/api/das';
import { Experience } from '@/api/genie';
import { Experience as ExpData, ExperienceType } from '@/api/resort';
import { DasPartiesProvider } from '@/contexts/DasParties';
import { ExperiencesProvider } from '@/contexts/Experiences';
import { Nav } from '@/contexts/Nav';
import { ParkProvider } from '@/contexts/Park';
import { ResortProvider } from '@/contexts/Resort';
import { click, render, screen, see, within } from '@/testing';

import TimesGuide from '../TimesGuide';

jest.mock('@/contexts/GenieClient');

function expectTimes(def: { [key: string]: { [key: string]: Experience[] } }) {
  for (const [land, subdef] of Object.entries(def)) {
    see(land, 'heading');
    for (const [expType, exps] of Object.entries(subdef)) {
      const c = within(screen.getByTestId(`${land}-${expType}`));
      c.getByRole('heading', { name: expType });
      expect(c.getAllByRole('cell').map(elem => elem.textContent)).toEqual(
        exps
          .map(exp => [
            String(
              exp.standby.waitTime ??
                exp.standby.displayNextShowTime ??
                (exp.standby.available ? '*' : '❌')
            ),
            exp.name,
          ])
          .flat(1)
      );
    }
  }
}

function exp(
  id: string,
  args: {
    type?: ExperienceType;
    waitTime?: number;
    showTimes?: string[];
    down?: true;
  } = {}
): Experience {
  return {
    ...(wdw.experience(id) as ExpData),
    id,
    park: mk,
    type: args.type || 'ATTRACTION',
    standby: {
      available: !args.down,
      waitTime: args.waitTime,
      displayNextShowTime: args.showTimes?.[0],
      unavailableReason: args.down && 'TEMPORARILY_DOWN',
    },
    displayAdditionalShowTimes: args.showTimes?.slice(1),
  };
}

const ddShowTimes = ['2:30 PM', '3:30 PM'];
const dd = exp('8075', {
  type: 'ENTERTAINMENT',
  showTimes: ddShowTimes,
});
const fofShowTime = '3:00 PM';
const fof = exp('17718925', {
  type: 'ENTERTAINMENT',
  showTimes: [fofShowTime],
});
const potc = exp('80010177', { waitTime: 30 });
const tiki = exp('16124144');
const btmr = exp('80010110', { waitTime: 60 });
const uts = exp('16767263', { down: true });
const tiana = exp('17505397', { type: 'CHARACTER', waitTime: 45 });
const experiences = [dd, fof, potc, tiki, btmr, tiana, uts];
const refreshExperiences = jest.fn();

function renderComponent(dasParties: DasParty[] = []) {
  render(
    <ResortProvider value={wdw}>
      <ParkProvider value={{ park: mk, setPark: () => null }}>
        <DasPartiesProvider value={dasParties}>
          <ExperiencesProvider
            value={{
              experiences,
              refreshExperiences,
              park: mk,
              setPark: () => null,
              loaderElem: null,
            }}
          >
            <Nav>
              <TimesGuide contentRef={{ current: null }} />
            </Nav>
          </ExperiencesProvider>
        </DasPartiesProvider>
      </ParkProvider>
    </ResortProvider>
  );
}

describe('TimesGuide', () => {
  it('renders times guide', async () => {
    renderComponent();

    click('Refresh Times');
    expect(refreshExperiences).toHaveBeenCalledTimes(1);

    expectTimes({
      'Main Street, USA': {
        Entertainment: [dd, fof],
      },
      Adventureland: {
        Attractions: [tiki, potc],
      },
      Frontierland: {
        Attractions: [btmr],
      },
      Fantasyland: {
        Attractions: [uts],
        Characters: [tiana],
      },
    });
    click(fofShowTime);
    expect(
      screen.queryByRole('heading', { name: fof.name, level: 2 })
    ).not.toBeInTheDocument();

    click(ddShowTimes[0]);
    await see.screen('Experience Info');
    see(dd.name, 'heading', { level: 2 });
    see('Upcoming Shows');
    expect(
      screen.getAllByRole('listitem').map(elem => elem.textContent)
    ).toEqual(ddShowTimes);

    see.no('DAS');
  });

  it('shows DAS button if eligible', async () => {
    renderComponent([party]);
    see('DAS', 'button');
  });
});
