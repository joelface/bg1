import { Nav } from '@/contexts/Nav';
import { RebookingProvider, useRebookingState } from '@/contexts/Rebooking';

import Home, { getDefaultTab } from './screens/Home';

export default function Merlock() {
  return (
    <RebookingProvider value={useRebookingState()}>
      <Nav>
        <Home tabName={getDefaultTab()} />
      </Nav>
    </RebookingProvider>
  );
}
