import { Nav } from '@/contexts/Nav';
import { PlansProvider, usePlansState } from '@/contexts/Plans';
import { RebookingProvider, useRebookingState } from '@/contexts/Rebooking';

import Home, { getDefaultTab } from './screens/Home';

export default function Merlock() {
  return (
    <PlansProvider value={usePlansState()}>
      <RebookingProvider value={useRebookingState()}>
        <Nav>
          <Home tabName={getDefaultTab()} />
        </Nav>
      </RebookingProvider>
    </PlansProvider>
  );
}
