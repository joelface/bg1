import { memo } from 'react';

import { Experience } from '@/api/genie';
import { Land } from '@/api/resort';
import Button from '@/components/Button';
import Screen from '@/components/Screen';
import Tab from '@/components/Tab';
import { useDasParties } from '@/contexts/DasParties';
import { useExperiences } from '@/contexts/Experiences';
import { useNav } from '@/contexts/Nav';
import { displayTime } from '@/datetime';

import DasPartyList from '../DasPartyList';
import { HomeTabProps } from '../Home';
import RefreshButton from '../RefreshButton';
import Legend, { Symbol } from './Legend';
import ParkSelect from './ParkSelect';

export default function TimesGuide({ contentRef }: HomeTabProps) {
  const { goTo } = useNav();
  const { experiences, refreshExperiences, loaderElem } = useExperiences();
  const parties = useDasParties();

  return (
    <Tab
      title="Times Guide"
      buttons={
        <>
          {parties.length > 0 && (
            <Button
              title="Disability Access Service"
              onClick={() => goTo(<DasPartyList parties={parties} />)}
            >
              DAS
            </Button>
          )}
          <ParkSelect />
          <RefreshButton name="Times" onClick={refreshExperiences} />
        </>
      }
      contentRef={contentRef}
    >
      <Experiences experiences={experiences} />
      {loaderElem}
    </Tab>
  );
}

const Experiences = memo(function Experiences({
  experiences,
}: {
  experiences: Experience[];
}) {
  const { goTo } = useNav();
  const showExpInfo = (exp: Experience) => goTo(<ExperienceInfo exp={exp} />);

  const expsByLand = new Map<Land, Record<Experience['type'], Experience[]>>();
  experiences
    .filter(
      exp =>
        exp.standby.available ||
        exp.standby.unavailableReason === 'TEMPORARILY_DOWN' ||
        exp.individual?.available
    )
    .sort((a, b) => a.land.sort - b.land.sort || a.name.localeCompare(b.name))
    .forEach(exp => {
      if (!expsByLand.has(exp.land)) {
        expsByLand.set(exp.land, {
          ATTRACTION: [],
          ENTERTAINMENT: [],
          CHARACTER: [],
          HOLIDAY: [],
        });
      }
      expsByLand.get(exp.land)?.[exp.type]?.push(exp);
    });

  return (
    <>
      {[...expsByLand].map(([land, expsByType]) => (
        <div key={land.name}>
          <h2
            className={`pr-1 ${land.theme.text} text-sm font-semibold text-right uppercase`}
          >
            {land.name}
          </h2>
          <div className="rounded overflow-hidden">
            <ExperienceList
              title="Attractions"
              land={land}
              experiences={expsByType.ATTRACTION}
              onInfoClick={showExpInfo}
            />
            <ExperienceList
              title="Entertainment"
              land={land}
              experiences={expsByType.ENTERTAINMENT}
              onInfoClick={showExpInfo}
            />
            <ExperienceList
              title="Holiday Entertainment"
              land={land}
              experiences={expsByType.HOLIDAY}
              onInfoClick={showExpInfo}
            />
            <ExperienceList
              title="Characters"
              land={land}
              experiences={expsByType.CHARACTER}
              onInfoClick={showExpInfo}
            />
          </div>
        </div>
      ))}
      {experiences.length > 0 && (
        <Legend>
          <Symbol sym="*" def="No posted wait/show time" />
          <Symbol sym="❌" def="Temporarily down" />
          <Symbol sym="VQ" def="Virtual queue" />
        </Legend>
      )}
    </>
  );
});

function ExperienceList({
  title,
  land,
  experiences,
  onInfoClick,
}: {
  title: string;
  land: Land;
  experiences: Experience[];
  onInfoClick: (experience: Experience) => void;
}) {
  if (experiences.length === 0) return null;
  return (
    <div className={`${land.theme.bg}`} data-testid={`${land.name}-${title}`}>
      <h3 className="mt-0 py-1 text-white text-xs font-semibold text-center uppercase">
        {title}
      </h3>
      <table className="w-full leading-snug">
        <tbody>
          {experiences.map(exp => (
            <tr className="group" key={exp.id}>
              <td
                className={`${
                  exp.standby.nextShowTime
                    ? 'min-w-[5.625rem]'
                    : 'min-w-[2.75rem]'
                } px-2 py-0.5 group-first:pt-1 group-last:pb-1 bg-white bg-opacity-80 font-bold text-center uppercase whitespace-nowrap`}
              >
                {exp.standby.nextShowTime ? (
                  (exp.additionalShowTimes?.length ?? 0) > 0 ? (
                    <button
                      onClick={() => onInfoClick(exp)}
                      className="underline"
                    >
                      {displayTime(exp.standby.nextShowTime)}
                    </button>
                  ) : (
                    displayTime(exp.standby.nextShowTime)
                  )
                ) : exp.standby.available ? (
                  exp.standby.waitTime ?? '*'
                ) : exp.virtualQueue &&
                  exp.standby.unavailableReason === 'NOT_STANDBY_ENABLED' ? (
                  'VQ'
                ) : (
                  '❌'
                )}
              </td>
              <td className="w-full px-1 pl-2 py-0.5 group-first:pt-1 group-last:pb-1 bg-white bg-opacity-90">
                <div className="flex items-center gap-x-2">
                  <div
                    className={`flex-1 ${
                      exp.type === 'ATTRACTION' &&
                      !exp.virtualQueue &&
                      (exp.priority ?? 4) < 4
                        ? `font-bold ${land.theme.text}`
                        : ''
                    }`}
                  >
                    {exp.name}
                  </div>
                  {exp?.individual && (
                    <div
                      className={`${land.theme.text} text-xs leading-tight font-semibold text-center uppercase`}
                    >
                      <div>
                        <abbr title="Individual Lightning Lane">ILL</abbr>
                        {': ' + exp.individual.displayPrice}
                      </div>
                      {exp.individual.nextAvailableTime && (
                        <div>
                          {displayTime(exp.individual.nextAvailableTime)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const ExperienceInfo = ({ exp }: { exp: Experience }) => (
  <Screen title="Experience Info">
    <h2>{exp.name}</h2>
    <div>{exp.park.name}</div>
    <h3>Upcoming {exp.type === 'CHARACTER' ? 'Appearances' : 'Shows'}</h3>
    <ul className="list-disc mt-2 pl-6">
      {!!exp.standby.nextShowTime && (
        <li>{displayTime(exp.standby.nextShowTime)}</li>
      )}
      {exp.additionalShowTimes?.map(time => (
        <li key={time}>{displayTime(time)}</li>
      ))}
    </ul>
  </Screen>
);
