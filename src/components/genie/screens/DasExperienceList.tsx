import { useEffect, useState } from 'react';

import { Experience } from '@/api/das';
import { Park } from '@/api/resort';
import Button from '@/components/Button';
import Screen from '@/components/Screen';
import { useDasClient } from '@/contexts/DasClient';
import { dateTimeStrings } from '@/datetime';
import useDataLoader from '@/hooks/useDataLoader';

function minutes(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

const waitTime = (time: string, now: number) => minutes(time) - now;

export default function DasExperienceList({
  park,
  onSelect,
}: {
  park: Park;
  onSelect: (experience: Experience) => void;
}) {
  const client = useDasClient();
  const { loadData, loaderElem } = useDataLoader();
  const [experiences, setExperiences] = useState<Experience[]>();

  useEffect(() => {
    loadData(async () => {
      const exps = await client.experiences(park);
      setExperiences(
        exps
          .filter(exp => exp.available && !!exp.nextAvailableTime)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    });
  }, [park, client, loadData]);

  const sublists = [
    { heading: 'Attractions', type: 'ATTRACTION' },
    { heading: 'Characters', type: 'CHARACTER' },
    { heading: 'Entertainment', type: 'ENTERTAINMENT' },
  ];

  return (
    <Screen title="Select Experience" theme={park.theme}>
      {experiences ? (
        experiences.length === 0 ? (
          <p>No DAS experiences available</p>
        ) : (
          <>
            {sublists.map(sl => (
              <Sublist
                park={park}
                experiences={experiences.filter(exp => exp.type === sl.type)}
                heading={sl.heading}
                onSelect={onSelect}
                key={sl.type}
              />
            ))}
          </>
        )
      ) : null}
      {loaderElem}
    </Screen>
  );
}

function Sublist({
  park,
  experiences,
  heading,
  onSelect,
}: {
  park: Park;
  experiences: Experience[];
  heading: string;
  onSelect: (experience: Experience) => void;
}) {
  if (experiences.length === 0) return null;
  const now = minutes(dateTimeStrings().time);
  return (
    <div className={`mt-4 rounded overflow-hidden ${park.theme.bg}`}>
      <h3 className="mt-0 py-1 text-white text-xs font-semibold text-center uppercase">
        {heading}
      </h3>
      <ul className="bg-white bg-opacity-90 leading-snug">
        {experiences.map(exp => (
          <li className="flex items-center pt-3 last:pb-3" key={exp.id}>
            <div className="flex-1 px-2">{exp.name}</div>
            <div className="px-2">
              <Button onClick={() => onSelect(exp)}>
                <span className="min-w-[4rem]">
                  {waitTime(exp.nextAvailableTime, now)}{' '}
                  <abbr title="minutes">min.</abbr>
                </span>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
