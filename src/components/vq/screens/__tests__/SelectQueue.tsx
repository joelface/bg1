import { client, mtwr, rotr, santa } from '@/__fixtures__/vq';
import { useNav } from '@/contexts/Nav';
import { VQClientProvider } from '@/contexts/VQClient';
import {
  click,
  loading,
  render,
  revisitTab,
  screen,
  see,
  within,
} from '@/testing';

import ChooseParty from '../ChooseParty';
import SelectQueue from '../SelectQueue';

jest.mock('@/contexts/Nav');
jest.useFakeTimers();

describe('SelectQueue', () => {
  const { goTo } = useNav();

  it('shows VQ selection screen', async () => {
    client.getQueues.mockResolvedValueOnce([]);
    render(
      <VQClientProvider value={client}>
        <SelectQueue />
      </VQClientProvider>
    );
    await loading();
    see('No virtual queues found');

    revisitTab(0);
    await loading();
    const lis = screen.getAllByRole('listitem');
    within(lis[0]).getByText(rotr.name);
    expect(lis[0]).toHaveTextContent('Next opening: 7:00 AM');
    expect(within(lis[0]).getByText('Join Queue')).toBeEnabled();
    within(lis[1]).getByText(santa.name);
    expect(lis[1]).toHaveTextContent('Available now');
    expect(within(lis[1]).getByText('Join Queue')).toBeEnabled();
    within(lis[2]).getByText(mtwr.name);
    expect(lis[2]).toHaveTextContent('No more openings today');
    expect(within(lis[2]).getByText('Closed')).toBeDisabled();

    click(screen.getAllByText('Join Queue')[0]);
    expect(goTo).toHaveBeenLastCalledWith(<ChooseParty queue={rotr} />);

    client.getQueues.mockResolvedValueOnce([
      { ...rotr, isAcceptingJoins: false, isAcceptingPartyCreation: false },
    ]);

    click('Refresh Queues');
    await loading();
  });
});
