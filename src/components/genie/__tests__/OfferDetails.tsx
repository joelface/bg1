import { h } from 'preact';

import { Guest } from '@/api/genie';
import { click, render, screen } from '@/testing';
import { offer, mickey, minnie, pluto } from '@/__fixtures__/genie';
import OfferDetails from '../OfferDetails';

const onConfirm = jest.fn();

const guests = [mickey, minnie, pluto];
const ineligibleGuests: Guest[] = [];

describe('OfferDetails', () => {
  it('renders offer details', () => {
    const { container } = render(
      <OfferDetails
        offer={offer}
        guests={guests}
        ineligibleGuests={ineligibleGuests}
        onConfirm={onConfirm}
      />
    );
    expect(container).toHaveTextContent('11:25 AM - 12:25 PM');
    screen.getByText('Your Party');
    screen.getByText('Mickey Mouse');
    screen.getByText('Minnie Mouse');
    screen.getByText('Pluto');
    click('Edit');
    click('Pluto');
    click('Minnie Mouse');
    click('Pluto');
    click('Confirm Party');
    click('Book Lightning Lane');
    expect(onConfirm).toBeCalledTimes(1);
    expect(onConfirm).lastCalledWith([mickey, pluto]);
  });
});
