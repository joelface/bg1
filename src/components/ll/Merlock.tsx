import { useState } from 'react';

import BookingDateProvider from '@/providers/BookingDateProvider';
import DasPartiesProvider from '@/providers/DasPartiesProvider';
import ExperiencesProvider from '@/providers/ExperiencesProvider';
import NavProvider from '@/providers/NavProvider';
import ParkProvider from '@/providers/ParkProvider';
import PlansProvider from '@/providers/PlansProvider';
import RebookingProvider from '@/providers/RebookingProvider';
import SchedulerProvider from '@/providers/SchedulerProvider';

import Home from './screens/Home';

export default function Merlock() {
  const [tabName] = useState(Home.getSavedTabName);
  return (
    <DasPartiesProvider>
      <PlansProvider>
        <BookingDateProvider>
          <ParkProvider>
            <ExperiencesProvider>
              <RebookingProvider>
                <SchedulerProvider>
                  <NavProvider>
                    <Home tabName={tabName} />
                  </NavProvider>
                </SchedulerProvider>
              </RebookingProvider>
            </ExperiencesProvider>
          </ParkProvider>
        </BookingDateProvider>
      </PlansProvider>
    </DasPartiesProvider>
  );
}
