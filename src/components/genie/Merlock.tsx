import { BookingDateProvider } from '@/contexts/BookingDate';
import { DasPartiesProvider } from '@/contexts/DasParties';
import { ExperiencesProvider } from '@/contexts/Experiences';
import { Nav } from '@/contexts/Nav';
import { ParkProvider } from '@/contexts/Park';
import { PlansProvider } from '@/contexts/Plans';
import { RebookingProvider } from '@/contexts/Rebooking';

import Home, { getDefaultTab } from './screens/Home';

export default function Merlock() {
  return (
    <DasPartiesProvider>
      <PlansProvider>
        <BookingDateProvider>
          <ParkProvider>
            <ExperiencesProvider>
              <RebookingProvider>
                <Nav>
                  <Home tabName={getDefaultTab()} />
                </Nav>
              </RebookingProvider>
            </ExperiencesProvider>
          </ParkProvider>
        </BookingDateProvider>
      </PlansProvider>
    </DasPartiesProvider>
  );
}
