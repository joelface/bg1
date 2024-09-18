import {
  booking,
  das,
  hm,
  jc,
  mickey,
  minnie,
  mk,
  party,
  wdw,
} from '@/__fixtures__/das';
import { ConflictsError } from '@/api/das';
import { useNav } from '@/contexts/Nav';
import { PlansProvider } from '@/contexts/Plans';
import { act, click, screen, see, waitFor, within } from '@/testing';

import BookingDetails from '../BookingDetails';
import DasExperienceList from '../DasExperienceList';
import DasSelection from '../DasSelection';
import Home from '../Home';

jest.mock('@/contexts/Nav');
jest.mock('@/ping');
const refreshPlans = jest.fn();
jest.spyOn(das, 'book').mockResolvedValue(booking);

function renderComponent() {
  wdw.render(
    <PlansProvider value={{ plans: [], refreshPlans, loaderElem: null }}>
      <DasSelection park={mk} party={party} />
    </PlansProvider>
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
    expect(goTo).toHaveBeenLastCalledWith(
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

    das.book.mockRejectedValueOnce(
      new ConflictsError({
        [minnie.id]: 'NOT_IN_PARK',
      })
    );
    click(bookBtn);
    expect(das.book).toHaveBeenLastCalledWith({
      park: mk,
      experience: hm,
      primaryGuest: mickey,
      guests: [mickey, minnie],
    });
    await waitFor(() => see('NOT IN PARK'));

    click('Change');
    expect(goTo).toHaveBeenCalledTimes(2);
    onSelect = jest.mocked(goTo).mock.lastCall?.[0].props.onSelect;
    act(() => onSelect(jc));
    await waitFor(() => see(jc.name));

    click(bookBtn);
    expect(das.book).toHaveBeenLastCalledWith({
      park: mk,
      experience: jc,
      primaryGuest: mickey,
      guests: [mickey, minnie],
    });
    await waitFor(() => expect(refreshPlans).toHaveBeenCalled());
    expect(goBack).toHaveBeenLastCalledWith({ screen: Home });
    expect(goTo).toHaveBeenLastCalledWith(
      <BookingDetails booking={booking} isNew={true} />
    );
  });
});
