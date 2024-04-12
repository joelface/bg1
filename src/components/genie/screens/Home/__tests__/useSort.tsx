import { hm, jc, mk, sm } from '@/__fixtures__/genie';
import { useExperiences } from '@/contexts/Experiences';
import { usePark } from '@/contexts/Park';
import { click, render, screen, waitFor, withCoords } from '@/testing';

import useSort from '../useSort';

jest.mock('@/contexts/Experiences');
jest.mock('@/contexts/Park');

const experiences = [hm, jc, sm];
jest.mocked(usePark).mockReturnValue({ park: mk, setPark: () => null });
jest.mocked(useExperiences).mockReturnValue({
  experiences,
  refreshExperiences: () => null,
  park: mk,
  setPark: () => null,
  loaderElem: null,
});

function SortTest() {
  const { sorter, SortSelect } = useSort();
  return (
    <div>
      <div data-testid="ids">
        {experiences
          .sort(sorter)
          .map(exp => exp.id)
          .join(',')}
      </div>
      <SortSelect />
    </div>
  );
}

const ids = (exps: { id: string }[]) => exps.map(exp => exp.id);
const sortedIds = () => screen.getByTestId('ids').textContent?.split(',');

function sortBy(type: string) {
  click('Sort By');
  click(type);
}

describe('useSort()', () => {
  it('sorts', async () => {
    render(<SortTest />);
    expect(sortedIds()).toEqual(ids([jc, sm, hm]));
    sortBy('Standby');
    expect(sortedIds()).toEqual(ids([sm, jc, hm]));
    sortBy('Soonest');
    expect(sortedIds()).toEqual(ids([sm, hm, jc]));
    sortBy('A to Z');
    expect(sortedIds()).toEqual(ids([hm, jc, sm]));
    await withCoords(jc.geo, async () => {
      sortBy('Nearby');
      await waitFor(() => expect(sortedIds()).toEqual(ids([jc, hm, sm])));
    });
  });
});
