import { useState } from 'react';

import {
  ConflictsError,
  DasParty,
  EligibilityConflicts,
  Experience,
  ExperienceUnavailable,
  Guest,
} from '@/api/das';
import { Park } from '@/api/data';
import Button from '@/components/Button';
import FloatingButton from '@/components/FloatingButton';
import GuestList from '@/components/GuestList';
import Screen from '@/components/Screen';
import { useDasClient } from '@/contexts/DasClient';
import { useNav } from '@/contexts/Nav';
import { usePlans } from '@/contexts/Plans';
import useDataLoader from '@/hooks/useDataLoader';
import { ping } from '@/ping';

import BookingDetails from './BookingDetails';
import DasExperienceList from './DasExperienceList';
import Home from './Home';

export default function DasSelection({
  park,
  party,
}: {
  park: Park;
  party: DasParty;
}) {
  const { goTo, goBack } = useNav();
  const client = useDasClient();
  const { refreshPlans } = usePlans();
  const [experience, setExperience] = useState<Experience>();
  const [selected, setSelected] = useState<Set<Guest>>(new Set(party));
  const [conflicts, setConflicts] = useState<EligibilityConflicts>({});
  const { loadData, loaderElem } = useDataLoader();

  async function book() {
    if (!experience) return;
    loadData(
      async () => {
        try {
          const booking = await client.book({
            park,
            experience,
            guests: [...selected],
          });
          refreshPlans();
          ping('D');
          await goBack({ screen: Home });
          goTo(<BookingDetails booking={booking} isNew={true} />);
        } catch (e) {
          if (e instanceof ConflictsError) setConflicts(e.conflicts);
          throw e;
        }
      },
      {
        messages: {
          [ConflictsError.name]: 'Some guests not eligible',
          [ExperienceUnavailable.name]: 'Experience currently unavailable',
        },
      }
    );
  }

  return (
    <Screen heading="DAS Selection" theme={park.theme}>
      <h3>Experience</h3>
      {experience ? (
        <div className="flex items-center mt-3">
          <div className="text-lg font-semibold truncate">
            {experience.name}
          </div>
          <div className="ml-3">
            <Button
              type="small"
              onClick={() =>
                goTo(
                  <DasExperienceList
                    park={park}
                    onSelect={exp => {
                      setExperience(exp);
                      goBack();
                    }}
                  />
                )
              }
            >
              Modify
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 text-center">
          <Button
            onClick={() =>
              goTo(
                <DasExperienceList
                  park={park}
                  onSelect={experience => {
                    setExperience(experience);
                    goBack();
                  }}
                />
              )
            }
          >
            Select Experience
          </Button>
        </div>
      )}
      <h3>DAS Guest</h3>
      <GuestList guests={party.slice(0, 1)} conflicts={conflicts} />
      {party.length > 1 && (
        <>
          <h3>Additional Guests</h3>
          <GuestList
            guests={party.slice(1)}
            selectable={{
              isSelected: g => selected.has(g),
              onToggle: g => {
                if (selected.has(g)) {
                  selected.delete(g);
                } else {
                  selected.add(g);
                }
                setSelected(new Set(selected));
              },
            }}
            conflicts={conflicts}
          />
        </>
      )}
      <FloatingButton disabled={!party || !experience} onClick={book}>
        Request Return Time
      </FloatingButton>

      {loaderElem}
    </Screen>
  );
}
