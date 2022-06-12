import { render, screen } from '/testing';
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
    screen.getByText('45 min');
  });

  it('shows no wait', () => {
    render(
      <StandbyTime
        experience={{ type: 'ATTRACTION', standby: { available: true } }}
      />
    );
    screen.getByText('now');
  });

  it('shows ride down', () => {
    render(
      <StandbyTime
        experience={{ type: 'ATTRACTION', standby: { available: false } }}
      />
    );
    screen.getByText('down');
  });

  it('shows next show time', () => {
    render(
      <StandbyTime
        experience={{
          type: 'ENTERTAINMENT',
          standby: { available: true, displayNextShowTime: '3:00 PM' },
        }}
      />
    );
    screen.getByText('3:00 PM');
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
    screen.getByText('none');
  });
});
