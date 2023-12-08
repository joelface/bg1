import { booking, hm, jc, mickey, minnie, mk, party } from '@/__fixtures__/das';
import { ConflictsError } from '@/api/das';
import { DasClientProvider } from '@/contexts/DasClient';
import { useNav } from '@/contexts/Nav';
import { PlansProvider } from '@/contexts/Plans';
import { act, click, render, screen, see, waitFor, within } from '@/testing';

import BookingDetails from '../BookingDetails';
import DasExperienceList from '../DasExperienceList';
import DasSelection from '../DasSelection';
import Home from '../Home';

jest.mock('@/contexts/Nav');
const refreshPlans = jest.fn();
const client = { book: jest.fn() };
client.book.mockResolvedValue(booking);

function renderComponent() {
  render(
    <DasClientProvider value={client as any}>
      <PlansProvider value={{ plans: [], refreshPlans, loaderElem: null }}>
        <DasSelection park={mk} party={party} />
      </PlansProvider>
    </DasClientProvider>
  );
}

describe('DasSelection', () => {
  const { goTo, goBack } = useNav();

  it('shows DAS Selection screen', async () => {
    renderComponent();
    within(see('DAS Guest').nextElementSibling as HTMLElement).getByText(
      mickey.name
    );
    within(
      see('Additional Guests').nextElementSibling as HTMLElement
    ).getByText(minnie.name);
    const bookBtn = see('Request Return Time');
    expect(bookBtn).toBeDisabled();

    click('Select Experience');
    expect(goTo).lastCalledWith(
      <DasExperienceList park={mk} onSelect={expect.any(Function)} />
    );

    expect(screen.getByRole('checkbox')).toBeChecked();
    click(minnie.name);
    expect(screen.getByRole('checkbox')).not.toBeChecked();

    click(minnie.name);
    expect(screen.getByRole('checkbox')).toBeChecked();

    let onSelect = jest.mocked(goTo).mock.lastCall?.[0].props.onSelect;
    act(() => onSelect(hm));
    await waitFor(() => see(hm.name));
    expect(bookBtn).toBeEnabled();

    client.book.mockRejectedValueOnce(
      new ConflictsError({
        [minnie.id]: 'NOT_IN_PARK',
      })
    );
    click(bookBtn);
    expect(client.book).lastCalledWith({
      park: mk,
      experience: hm,
      guests: [mickey, minnie],
    });
    await waitFor(() => see('NOT IN PARK'));

    click('Modify');
    expect(goTo).toBeCalledTimes(2);
    onSelect = jest.mocked(goTo).mock.lastCall?.[0].props.onSelect;
    act(() => onSelect(jc));
    await waitFor(() => see(jc.name));

    click(bookBtn);
    expect(client.book).lastCalledWith({
      park: mk,
      experience: jc,
      guests: [mickey, minnie],
    });
    await waitFor(() => expect(refreshPlans).toBeCalled());
    expect(goBack).lastCalledWith({ screen: Home });
    expect(goTo).lastCalledWith(
      <BookingDetails booking={booking} isNew={true} />
    );
  });
});
