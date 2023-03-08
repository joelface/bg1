import { click, render, screen, withCoords } from '@/testing';

import useCoords from '../useCoords';
import useDataLoader from '../useDataLoader';

jest.useFakeTimers();

function App() {
  const { loadData } = useDataLoader();
  const [coords, updateCoords] = useCoords(loadData);
  return (
    <>
      <div>{coords ? coords.join(',') : 'unknown'}</div>
      <button onClick={updateCoords}>Locate</button>
    </>
  );
}

const renderComponent = () => render(<App />);

describe('useCoords()', () => {
  it('updates geolocation coordinates', async () => {
    renderComponent();
    for (const coords of [
      [41.4482, -85.2615],
      [41.3655, -85.2372],
      undefined,
    ] as const) {
      await withCoords(coords, async () => {
        click('Locate');
        await screen.findByText(coords ? coords.join(',') : 'unknown');
      });
    }
  });
});
