import { useEffect, useState } from 'react';

import { ClientProvider } from '@/contexts/Client';
import { click, render, screen, setTime, waitFor } from '@/testing';
import { client } from '@/__fixtures__/genie';
import TimeBanner from '../TimeBanner';

jest.useFakeTimers();

function Banner(props: Omit<Parameters<typeof TimeBanner>[0], 'isLoading'>) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoading) setIsLoading(false);
  }, [isLoading]);
  return (
    <ClientProvider value={client}>
      <div data-testid="banner">
        <TimeBanner update={isLoading} {...props} />
      </div>
      <button onClick={() => setIsLoading(true)}>Refresh</button>
    </ClientProvider>
  );
}

const refresh = () => {
  click('Refresh');
};

describe('TimeBanner', () => {
  it('renders pre-enrollment time banner', async () => {
    setTime('06:59');
    render(<TimeBanner startTime="07:00:00" dropTime="11:30:00" />);
    expect(screen.getByText('Book:')).toHaveTextContent('Book: 7:00 AM');
    expect(screen.getByText('Drop:')).toHaveTextContent('Drop: 11:30 AM');
  });

  it('updates book time when isLoading is true', async () => {
    setTime('10:00');
    render(<Banner dropTime="11:30:00" />);
    refresh();
    expect(await screen.findByText('Book:')).toHaveTextContent(
      'Book: 11:00 AM'
    );
    expect(screen.getByText('Drop:')).toHaveTextContent('Drop: 11:30 AM');

    setTime('10:00:59');
    client.nextBookTime.mockResolvedValueOnce('12:00:00');
    refresh();

    setTime('10:01');
    refresh();
    await waitFor(() =>
      expect(screen.getByText('Book:')).toHaveTextContent('Book: 12:00 PM')
    );
    expect(client.nextBookTime).toHaveBeenCalledTimes(2);

    setTime('11:30');
    refresh();
    await waitFor(() =>
      expect(screen.getByText('Drop:')).toHaveTextContent('Drop: now')
    );
  });

  it('renders nothing if no times to show', async () => {
    const { container } = render(<TimeBanner />);
    expect(container).toBeEmptyDOMElement();
  });
});
