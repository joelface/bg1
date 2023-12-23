import { ep, mk, wdw } from '@/__fixtures__/genie';
import { dateTimeStrings } from '@/datetime';
import { click, render, see } from '@/testing';

import { PARK_KEY, useParkState } from '../Park';

jest.mock('@/contexts/ResortData', () => {
  return { useResortData: () => wdw };
});

function ParkTest() {
  const { park, setPark } = useParkState();
  return (
    <div>
      <h1>{park.name}</h1>
      <button onClick={() => setPark(ep)}>Hop to {ep.name}</button>
    </div>
  );
}

describe('useParkState()', () => {
  it('saves selected park', async () => {
    render(<ParkTest />);
    see(mk.name);
    click(`Hop to ${ep.name}`);
    see(ep.name);
    expect(JSON.parse(localStorage.getItem(PARK_KEY) || '{}')).toEqual({
      id: ep.id,
      date: dateTimeStrings().date,
    });
  });
});
