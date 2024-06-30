import { render, see } from '@/testing';

import StandbyTime from '../StandbyTime';

describe('StandbyTime', () => {
  it('shows wait time', () => {
    render(
      <StandbyTime
        experience={{
          type: 'ATTRACTION',
          standby: { available: true, waitTime: 45 },
        }}
      />
    );
    see('45 min');
  });

  it('shows no wait', () => {
    render(
      <StandbyTime
        experience={{ type: 'ATTRACTION', standby: { available: true } }}
      />
    );
    see('now');
  });

  it('shows ride down', () => {
    render(
      <StandbyTime
        experience={{ type: 'ATTRACTION', standby: { available: false } }}
      />
    );
    see('down');
  });

  it('shows next show time', () => {
    render(
      <StandbyTime
        experience={{
          type: 'ENTERTAINMENT',
          standby: { available: true, nextShowTime: '15:00:00' },
        }}
      />
    );
    see('3:00 PM');
  });

  it('shows no next show', () => {
    render(
      <StandbyTime
        experience={{
          type: 'ENTERTAINMENT',
          standby: { available: false },
        }}
      />
    );
    see('none');
  });

  it('shows next VQ open time', () => {
    render(
      <StandbyTime
        experience={{
          type: 'ATTRACTION',
          standby: { available: true },
          virtualQueue: {
            available: true,
            nextAvailableTime: '07:00:00',
          },
        }}
      />
    );
    see('VQ');
    see('7:00 AM');
  });

  it('shows closed VQ', () => {
    render(
      <StandbyTime
        experience={{
          type: 'ATTRACTION',
          standby: { available: true },
          virtualQueue: { available: true },
        }}
      />
    );
    see('VQ');
    see('closed');
  });
});
