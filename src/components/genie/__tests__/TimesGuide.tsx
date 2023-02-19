import { useState } from 'react';

import data from '@/api/data/wdw';
import { ExpData, Experience, ExperienceType } from '@/api/genie';
import { ModalProvider } from '@/contexts/Modal';
import { click, render, screen, within } from '@/testing';
import TimesGuide from '../TimesGuide';

function expectTimes(def: { [key: string]: { [key: string]: Experience[] } }) {
  for (const [land, subdef] of Object.entries(def)) {
    screen.getByRole('heading', { name: land });
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

const mk = data.parks[0];

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
    ...(data.experiences[id] as ExpData),
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

function TimesGuideTest() {
  const [modal, setModal] = useState({
    elem: null as React.ReactNode,
    show: (elem: React.ReactNode) => setModal({ ...modal, elem }),
    close: () => modal.show(null),
  });
  return (
    <ModalProvider value={modal}>
      {modal.elem ?? (
        <TimesGuide
          experiences={experiences}
          refresh={() => null}
          toggleStar={() => null}
        />
      )}
    </ModalProvider>
  );
}

describe('TimesGuide', () => {
  it('renders times guide', () => {
    render(<TimesGuideTest />);
    expectTimes({
      'Main Street, USA': {
        Entertainment: [dd, fof],
      },
      Adventureland: {
        Attractions: [potc, tiki],
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
    screen.getByRole('heading', { name: dd.name, level: 2 });
    screen.getByText('Upcoming Shows');
    expect(
      screen.getAllByRole('listitem').map(elem => elem.textContent)
    ).toEqual(ddShowTimes);
  });
});
