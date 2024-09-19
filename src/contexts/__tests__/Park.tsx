import { ep, mk, wdw } from '@/__fixtures__/genie';
import { click, render, see } from '@/testing';

import { ParkProvider, usePark } from '../Park';
import { ResortProvider } from '../Resort';

function Test() {
  return (
    <ResortProvider value={wdw}>
      <ParkProvider>
        <ParkConsumer />
      </ParkProvider>
    </ResortProvider>
  );
}

function ParkConsumer() {
  const { park, setPark } = usePark();
  return (
    <div>
      <h1>{park.name}</h1>
      <button onClick={() => setPark(ep)}>Hop to {ep.name}</button>
    </div>
  );
}

describe('useParkState()', () => {
  it('saves selected park', async () => {
    const { unmount } = render(<Test />);
    see(mk.name, 'heading');
    click(`Hop to ${ep.name}`);
    see(ep.name, 'heading');

    unmount();
    render(<Test />);
    see(ep.name, 'heading');
  });
});
