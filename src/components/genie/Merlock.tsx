import { Nav } from '@/contexts/Nav';
import { ParkProvider, useParkState } from '@/contexts/Park';
import { PlansProvider, usePlansState } from '@/contexts/Plans';
import { RebookingProvider, useRebookingState } from '@/contexts/Rebooking';

import Home, { getDefaultTab } from './screens/Home';

export default function Merlock() {
  return (
    <PlansProvider value={usePlansState()}>
      <RebookingProvider value={useRebookingState()}>
        <ParkProvider value={useParkState()}>
          <Nav>
            <Home tabName={getDefaultTab()} />
          </Nav>
        </ParkProvider>
      </RebookingProvider>
    </PlansProvider>
  );
}
